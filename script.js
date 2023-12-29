let presents_url = "{{PRESENTS_URL}}"
let is_file = "true"//"{{ IS_FILE }}"

function is_64_bit() {
    return Process.pointerSize === 8;
}

function log(message) {
    Java.perform(function () {
        var Log = Java.use("android.util.Log");
        Log.i("tbcml", message);
        console.info(message);
    });
}

function getPackageName() {
    return Java.use("android.app.ActivityThread").currentApplication().getPackageName();
}


if (is_64_bit()) {
    let func_name = "_ZN5Botan11PK_Verifier14verify_messageEPKhmS2_m" // 64 bit

    // Botan::PK_Verifier::verify_message(unsigned char const*, unsigned long, unsigned char const*, unsigned long)
    Interceptor.attach(Module.findExportByName("libnative-lib.so", func_name), {
        onLeave: function (retval) {
            retval.replace(0x1)
        }
    })
}
else {
    let func_name = "_ZN5Botan11PK_Verifier14verify_messageEPKhjS2_j" // 32 bit

    // Botan::PK_Verifier::verify_message(unsigned char const*, unsigned long, unsigned char const*, unsigned long)
    Interceptor.attach(Module.findExportByName("libnative-lib.so", func_name), {
        onLeave: function (retval) {
            retval.replace(0x1)
        }
    })
}


function get_nonce_from_url(url) {
    if (!url.toString().includes("nonce=")) {
        return null
    }
    let nonce = url.toString().split("nonce=")[1].split("&")[0]
    return nonce
}

function get_direct_byte_buffer_from_string(str) {
    let new_data_buffer = Java.array('byte', str.split('').map(function (c) {
        return c.charCodeAt(0);
    }));
    let new_data_directByteBuffer = Java.use("java.nio.DirectByteBuffer").allocateDirect(new_data_buffer.length);
    new_data_directByteBuffer.put(new_data_buffer);
    new_data_directByteBuffer.flip();
    return new_data_directByteBuffer
}

function get_headers() {
    let headers_obj = {
        "Content-Type": "application/json",
        "Nyanko-Signature": "A"
    }
    let headers = JSON.stringify(headers_obj)
    return headers

}

function readFile(path) {
    let File = Java.use("java.io.File");
    let FileInputStream = Java.use("java.io.FileInputStream");
    let InputStreamReader = Java.use("java.io.InputStreamReader");
    let BufferedReader = Java.use("java.io.BufferedReader");
    let file = File.$new(path);
    if (!file.exists()) {
        return null
    }
    let fileInputStream = FileInputStream.$new(file);
    let inputStreamReader = InputStreamReader.$new(fileInputStream);
    let bufferedReader = BufferedReader.$new(inputStreamReader);
    let stringBuilder = Java.use("java.lang.StringBuilder").$new();
    let line = null;
    while ((line = bufferedReader.readLine()) != null) {
        stringBuilder.append(line);
    }
    bufferedReader.close();
    return stringBuilder.toString();
}

function get_internal_storage_path() {
    let File = Java.use("java.io.File");
    let Environment = Java.use("android.os.Environment");
    let path = File.$new(Environment.getDataDirectory(), "data/" + getPackageName()).getAbsolutePath();
    return path
}

function download_file(url) {
    // download file and return string
    let URL = Java.use("java.net.URL");
    let BufferedReader = Java.use("java.io.BufferedReader");
    let InputStreamReader = Java.use("java.io.InputStreamReader");
    let StringBuilder = Java.use("java.lang.StringBuilder");
    let url_obj = URL.$new(url);
    let urlConnection = url_obj.openConnection();
    let inputStreamReader = InputStreamReader.$new(urlConnection.getInputStream());
    let bufferedReader = BufferedReader.$new(inputStreamReader);
    let stringBuilder = StringBuilder.$new();
    let inputLine = null;
    while ((inputLine = bufferedReader.readLine()) != null) {
        stringBuilder.append(inputLine);
    }
    bufferedReader.close();
    return stringBuilder.toString();
}

function get_lib_folder() {
    // get lib folder in /data/app/<package_name>-<random>/lib/arm64
    let context = Java.use("android.app.ActivityThread").currentApplication().getApplicationContext();
    let applicationInfo = context.getApplicationInfo();
    let nativeLibraryDir = applicationInfo.nativeLibraryDir.value;
    return nativeLibraryDir
}

function get_presents() {
    let data = null
    if (is_file == true || is_file.toLowerCase() == "true") {
        let path = get_lib_folder() + `/libpresents.json.so`
        data = readFile(path)
    }
    else {
        data = download_file(presents_url)
    }
    let presents = JSON.parse(data)

    return presents
}

Java.perform(function () {
    let MyActivity = Java.use("jp.co.ponos.battlecats.MyActivity");
    MyActivity["newResponse"].implementation = function (handle, response_code, url, headers, data, flag) {
        if (url.toString().includes("https://nyanko-items.ponosgames.com/v4/presents/count?")) {
            let nonce = get_nonce_from_url(url)
            if (nonce == null) {
                return
            }
            let timestamp = Date.now()
            let count = get_presents().length

            let new_data = `{"statusCode":1,"nonce":"${nonce}","payload":{"count":${count}},"timestamp": ${timestamp}}`

            headers = get_headers()
            data = get_direct_byte_buffer_from_string(new_data)
            response_code = 200

        }
        else if (url.toString().includes("https://nyanko-items.ponosgames.com/v4/presents?")) {
            let nonce = get_nonce_from_url(url)
            if (nonce == null) {
                return
            }
            let timestamp = Date.now()
            let presents_string = JSON.stringify(get_presents())

            let new_data = `{"statusCode":1,"nonce":"${nonce}","payload":{"presents":${presents_string}},"timestamp": ${timestamp}}`

            headers = get_headers()
            data = get_direct_byte_buffer_from_string(new_data)
            response_code = 200
        }
        else if (url.includes("https://nyanko-items.ponosgames.com/v3/presents//reception?")) {
            let nonce = get_nonce_from_url(url)
            if (nonce == null) {
                return
            }
            let timestamp = Date.now()
            let new_data = `{"statusCode":1,"nonce":"${nonce}","timestamp": ${timestamp}}`

            headers = get_headers()
            data = get_direct_byte_buffer_from_string(new_data)
            response_code = 200

        };
        this["newResponse"](handle, response_code, url, headers, data, flag);
    }
})