//#region Constants
const AUTHOR_NAME = 'Korosium';

const AVAILABLE_ENCODING = [
    'Binary',
    'Octal',
    'Decimal',
    'Hex',
    'Base32 (RFC-4648)',
    'Base32 (Extended hex)',
    'Base32 (z-base)',
    'Base32 (Crockford)',
    'Base64',
    'UTF-8'
];
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
    swap_values_html_elements(input_type_select, output_type_select);
    swap_values_html_elements(input_textarea, output_textarea);
};

/**
 * Show the converted input's new output.
 */
const show_converted_input = () => output_textarea.value = convert_input(input_textarea.value, input_type_select.value, output_type_select.value);

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
const to_base64 = arr => btoa(to_utf8(arr));

/**
 * Convert a byte array to a UTF-8 string.
 * 
 * @param {number[]} arr The byte array to convert.
 * 
 * @returns {string} The UTF-8 string.
 */
const to_utf8 = arr => arr.map(x => String.fromCharCode(x)).join('');

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
            case AVAILABLE_ENCODING[0]: return to_bin(bytes);
            case AVAILABLE_ENCODING[1]: return to_oct(bytes);
            case AVAILABLE_ENCODING[2]: return to_dec(bytes);
            case AVAILABLE_ENCODING[3]: return to_hex(bytes);
            case AVAILABLE_ENCODING[4]: return base32.RFC_4648.encode(bytes);
            case AVAILABLE_ENCODING[5]: return base32.BASE_32_HEX.encode(bytes);
            case AVAILABLE_ENCODING[6]: return base32.Z_BASE_32.encode(bytes);
            case AVAILABLE_ENCODING[7]: return base32.CROCKFORD_BASE_32.encode(bytes);
            case AVAILABLE_ENCODING[8]: return to_base64(bytes);
            case AVAILABLE_ENCODING[9]: return to_utf8(bytes);
        }
    } catch (error) {
        return '';
    }
};

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
            case AVAILABLE_ENCODING[0]: return from_bin(s);
            case AVAILABLE_ENCODING[1]: return from_oct(s);
            case AVAILABLE_ENCODING[2]: return from_dec(s);
            case AVAILABLE_ENCODING[3]: return from_hex(s);
            case AVAILABLE_ENCODING[4]: return base32.RFC_4648.decode.to_array(s);
            case AVAILABLE_ENCODING[5]: return base32.BASE_32_HEX.decode.to_array(s);
            case AVAILABLE_ENCODING[6]: return base32.Z_BASE_32.decode.to_array(s);
            case AVAILABLE_ENCODING[7]: return base32.CROCKFORD_BASE_32.decode.to_array(s);
            case AVAILABLE_ENCODING[8]: return from_base64(s);
            case AVAILABLE_ENCODING[9]: return from_utf8(s);
        }
    } catch (error) {
        return [];
    }
};

/**
 * Populate a HTML select element with an array.
 * 
 * @param {HTMLSelectElement}   select The select element to populate.
 * @param {string[] | number[]} array  The array used to populate the select.
 */
const fill_select = (select, array) => {
    for (let i = 0; i < array.length; i++) {
        const option = document.createElement('option');
        option.value = array[i];
        option.innerHTML = array[i];
        select.append(option);
    }
};
//#endregion

//#region On Load

/**
 * Initialize the elements on the page before doing anything with them.
 */
const init = () => {
    fill_select(input_type_select, AVAILABLE_ENCODING);
    fill_select(output_type_select, AVAILABLE_ENCODING);
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