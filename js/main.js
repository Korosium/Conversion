//#region Constants
const AUTHOR_NAME = 'Korosium';

const AVAILABLE_ENCODING = {
    'Common': [
        'UTF-8',
        'Binary',
        'Octal',
        'Decimal',
        'Hex',
        'Base64'
    ],
    'Base32': [
        'Base32 (RFC-4648)',
        'Base32 (Extended hex)',
        'Base32 (z-base)',
        'Base32 (Crockford)'
    ]
};

const AVAILABLE_DECODING = {
    'Common': [
        'UTF-8',
        'Binary',
        'Octal',
        'Decimal',
        'Hex',
        'Base64',
        'Base64 (URL Safe)'
    ],
    'Base32': [
        'Base32 (RFC-4648)',
        'Base32 (Extended hex)',
        'Base32 (z-base)',
        'Base32 (Crockford)'
    ],
    'Rotation': [
        'ROT5 [0-9]',
        'ROT13 [A-Z, a-z]',
        'ROT18 [0-9, A-Z, a-z]',
        'ROT47 [!-~]'
    ],
    'Other': [
        'Reverse'
    ]
};
//#endregion

//#region HTML Elements
const input_type_select = document.getElementById('input-type-select');
const output_type_select = document.getElementById('output-type-select');
const input_textarea = document.getElementById('input-textarea');
const output_textarea = document.getElementById('output-textarea');
const button_switch = document.getElementById('button-switch');
//#endregion

//#region Event Listeners
input_type_select.onchange = () => show_converted_input();
output_type_select.onchange = () => show_converted_input();
input_textarea.oninput = () => show_converted_input();
button_switch.onclick = () => swap_html_elements();
output_textarea.onclick = () => navigator.clipboard.writeText(output_textarea.value);
//#endregion

//#region Functions

/**
 * Swap the values of two HTML elements.
 * 
 * @param {HTMLSelectElement | HTMLTextAreaElement} e1 The first element to swap.
 * @param {HTMLSelectElement | HTMLTextAreaElement} e2 The second element to swap.
 */
const swap_values_html_elements = (e1, e2) => {
    const temp = e1.value;
    e1.value = e2.value;
    e2.value = temp;
};

/**
 * Swap the values of the input and output textarea.
 */
const swap_html_elements = () => {
    const input_type = input_type_select.value;
    const output_type = output_type_select.value;

    // To deal with Base64 encoded strings.
    if(AVAILABLE_DECODING.Common.indexOf(output_type) === 6){
        input_type_select.value = 'Base64';
        output_type_select.value = input_type;
    }
    
    // Anything that is a string but has no equivalent in the encoding side of things.
    else if(AVAILABLE_ENCODING.Common.indexOf(output_type) === -1 && AVAILABLE_ENCODING.Base32.indexOf(output_type) === -1){
        input_type_select.value = 'UTF-8';
        output_type_select.value = input_type;
    }

    // If everything is fine swaps the two select fields values.
    else{
        swap_values_html_elements(input_type_select, output_type_select);
    }

    swap_values_html_elements(input_textarea, output_textarea);
    show_converted_input();
};

/**
 * Show the converted input's new output.
 */
const show_converted_input = () => output_textarea.value = convert_input(input_textarea.value, input_type_select.value, output_type_select.value);

/**
 * Convert a radix based string to a byte array.
 * 
 * @param {string} s      The radix based string to convert.
 * @param {number} radix  The radix of the string.
 * @param {number} length The length of a padded section.
 * 
 * @returns {number[]} The byte array.
 */
const from_radix = (s, radix, length) => {
    let to_pad = length - s.length % length;
    if (to_pad === length) to_pad = 0;
    const to_process = s.padStart(s.length + to_pad, '0');
    let arr = [];
    for (let i = 0; i < to_process.length; i += length) {
        arr.push(parseInt(to_process.slice(i, i + length), radix));
    }
    return arr;
};

/**
 * Convert a binary string to a byte array.
 * 
 * @param {string} s The binary string to convert.
 * 
 * @returns {number[]} The byte array.
 */
const from_bin = s => from_radix(s, 2, 8);

/**
 * Convert an octal string to a byte array.
 * 
 * @param {string} s The octal string to convert.
 * 
 * @returns {number[]} The byte array.
 */
const from_oct = s => from_radix(s, 8, 3);

/**
 * Convert a decimal string to a byte array.
 * 
 * @param {string} s The decimal string to convert.
 * 
 * @returns {number[]} The byte array.
 */
const from_dec = s => from_hex(BigInt(s).toString(16));

/**
 * Convert a hex string to a byte array.
 * 
 * @param {string} s The hex string to convert.
 * 
 * @returns {number[]} The byte array.
 */
const from_hex = s => from_radix(s, 16, 2);

/**
 * Convert a base64 string to a byte array.
 * 
 * @param {string} s The base64 string to convert.
 * 
 * @returns {number[]} The byte array.
 */
const from_base64 = s => atob(s.replaceAll('-', '+').replaceAll('_', '/')).split('').map(x => x.charCodeAt());

/**
 * Convert a UTF-8 string to a byte array.
 * 
 * @param {string} s The UTF-8 string to convert.
 * 
 * @returns {number[]} The byte array.
 */
const from_utf8 = s => [].slice.call(new TextEncoder().encode(s));

/**
 * Convert the input string to a byte array.
 * 
 * @param {string} s          The input string to convert.
 * @param {string} input_type The type of the input string.
 * 
 * @returns {number[]} The byte array.
 */
const convert_input_to_byte_array = (s, input_type) => {
    if(s.length === 0) return [];
    try {
        switch (input_type) {
            case AVAILABLE_ENCODING.Common[0]: return from_utf8(s);
            case AVAILABLE_ENCODING.Common[1]: return from_bin(s);
            case AVAILABLE_ENCODING.Common[2]: return from_oct(s);
            case AVAILABLE_ENCODING.Common[3]: return from_dec(s);
            case AVAILABLE_ENCODING.Common[4]: return from_hex(s);
            case AVAILABLE_ENCODING.Common[5]: return from_base64(s);

            case AVAILABLE_ENCODING.Base32[0]: return base32.RFC_4648.decode.to_array(s);
            case AVAILABLE_ENCODING.Base32[1]: return base32.BASE_32_HEX.decode.to_array(s);
            case AVAILABLE_ENCODING.Base32[2]: return base32.Z_BASE_32.decode.to_array(s);
            case AVAILABLE_ENCODING.Base32[3]: return base32.CROCKFORD_BASE_32.decode.to_array(s);
        }
    } catch (error) {
        return [];
    }
};

/**
 * Convert a byte array to a radix based string.
 * 
 * @param {number[]} arr    The byte array to convert.
 * @param {number}   radix  The radix of the string.
 * @param {number}   length The length of a padded section.
 * 
 * @returns {string} The new radix based string.
 */
const to_radix = (arr, radix, length) => arr.map(x => x.toString(radix).padStart(length, '0')).join('');

/**
 * Convert a byte array to a binary string.
 * 
 * @param {number[]} arr The byte array to convert.
 * 
 * @returns {string} The binary string.
 */
const to_bin = arr => to_radix(arr, 2, 8);

/**
 * Convert a byte array to a octal string.
 * 
 * @param {number[]} arr The byte array to convert.
 * 
 * @returns {string} The octal string.
 */
const to_oct = arr => to_radix(arr, 8, 3);

/**
 * Convert a byte array to a decimal string.
 * 
 * @param {number[]} arr The byte array to convert.
 * 
 * @returns {string} The decimal string.
 */
const to_dec = arr => BigInt(`0x${to_hex(arr)}`);

/**
 * Convert a byte array to a hex string.
 * 
 * @param {number[]} arr The byte array to convert.
 * 
 * @returns {string} The hex string.
 */
const to_hex = arr => to_radix(arr, 16, 2);

/**
 * Convert a byte array to a base64 string.
 * 
 * @param {number[]} arr The byte array to convert.
 * 
 * @returns {string} The base64 string.
 */
const to_base64 = arr => btoa(arr.map(x => String.fromCharCode(x)).join(''));


const to_base64_safe = arr => btoa(arr.map(x => String.fromCharCode(x)).join('')).replaceAll('+', '-').replaceAll('/', '_');

/**
 * Convert a byte array to a UTF-8 string.
 * 
 * @param {number[]} arr The byte array to convert.
 * 
 * @returns {string} The UTF-8 string.
 */
const to_utf8 = arr => new TextDecoder().decode(new Uint8Array(arr));

/**
 * Convert the input to another encoding.
 * 
 * @param {string} s           The input string to convert.
 * @param {string} input_type  The type of the input string.
 * @param {string} output_type The type of the output string.
 * 
 * @returns {string} The new encoding for the input string.
 */
const convert_input = (s, input_type, output_type) => {
    const bytes = convert_input_to_byte_array(s, input_type);
    if (bytes.length === 0) return '';
    try {
        switch (output_type) {
            case AVAILABLE_DECODING.Common[0]: return to_utf8(bytes);
            case AVAILABLE_DECODING.Common[1]: return to_bin(bytes);
            case AVAILABLE_DECODING.Common[2]: return to_oct(bytes);
            case AVAILABLE_DECODING.Common[3]: return to_dec(bytes);
            case AVAILABLE_DECODING.Common[4]: return to_hex(bytes);
            case AVAILABLE_DECODING.Common[5]: return to_base64(bytes);
            case AVAILABLE_DECODING.Common[6]: return to_base64_safe(bytes);

            case AVAILABLE_DECODING.Base32[0]: return base32.RFC_4648.encode(bytes);
            case AVAILABLE_DECODING.Base32[1]: return base32.BASE_32_HEX.encode(bytes);
            case AVAILABLE_DECODING.Base32[2]: return base32.Z_BASE_32.encode(bytes);
            case AVAILABLE_DECODING.Base32[3]: return base32.CROCKFORD_BASE_32.encode(bytes);

            case AVAILABLE_DECODING.Rotation[0]: return rot.rot5(to_utf8(bytes));
            case AVAILABLE_DECODING.Rotation[1]: return rot.rot13(to_utf8(bytes));
            case AVAILABLE_DECODING.Rotation[2]: return rot.rot18(to_utf8(bytes));
            case AVAILABLE_DECODING.Rotation[3]: return rot.rot47(to_utf8(bytes));
            
            case AVAILABLE_DECODING.Other[0]: return to_utf8(bytes).split('').reverse().join('');
        }
    } catch (error) {
        return '';
    }
};

/**
 * Populate a HTML select element with an array.
 * 
 * @param {HTMLSelectElement}   select The select element to populate.
 * @param {string[] | number[]} array  The array used to populate the select.
 */
const fill_select = (select, array) => {
    const type = Object.prototype.toString.call(array);
    if (type === '[object Object]') {
        const keys = Object.keys(array);
        for (let i = 0; i < keys.length; i++) {
            const option_group = document.createElement('optgroup');
            option_group.label = keys[i];
            option_group.innerHTML = keys[i];
            for (let j = 0; j < array[keys[i]].length; j++) {
                const option = document.createElement('option');
                option.value = array[keys[i]][j];
                option.innerHTML = array[keys[i]][j];
                option_group.append(option);
            }
            select.append(option_group);
        }
    }
    else if (type === '[object Array]') {
        for (let i = 0; i < array.length; i++) {
            const option = document.createElement('option');
            option.value = array[i];
            option.innerHTML = array[i];
            select.append(option);
        }
    }
};
//#endregion

//#region On Load

/**
 * Initialize the elements on the page before doing anything with them.
 */
const init = () => {
    fill_select(input_type_select, AVAILABLE_ENCODING);
    fill_select(output_type_select, AVAILABLE_DECODING);
    input_type_select.value = 'UTF-8';
    output_type_select.value = 'Base64';
    input_textarea.value = '';
    show_converted_input();
    document.getElementsByTagName('footer')[0].innerHTML += `<p>Copyright © ${new Date().getFullYear()} ${AUTHOR_NAME}</p>`;
};

/**
 * Run this function after the page has loaded.
 */
const main = () => {
    init();
};

window.onload = main;
//#endregion
