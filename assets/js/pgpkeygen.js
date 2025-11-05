/**
 * Debug msg handler.
 */
var _debug = function(msg) {
    var dbg = false;

    if (dbg) {
        console.log(msg);
    }
}

/**
 * Generate a key pair and place base64 encoded values into specified DOM elements.
 */
var genKeyPair = async function() {

    // Get params from user input
    var name = $('#name').val();
    var email = $('#email').val();
    var comments = $('#comments').val();
    var bitlength = parseInt($('#bitlength').val());
    var algorithm = $('#algorithm').val();
    var expire = $('#expire').val();
    var passphrase = $('#passphrase').val();

    var userIDs = [{ name: name, email: email }];
    if (comments) {
        userIDs[0].comment = comments;
    }

    // Disable/update the action button
    _debug("Update buttons");
    $('#generate_keys_btn').css('pointer-events', 'none');
    $('#generate_keys_btn').addClass("disabled");
    $('#generate_keys_btn').val("Generating .");

    var options = {
        userIDs: userIDs,
        passphrase: passphrase
    };

    if (algorithm === 'ecc') {
        options.curve = 'curve25519';
    } else {
        options.rsaBits = bitlength;
    }

    const { privateKey, publicKey, revocationCertificate } = await openpgp.generateKey(options);

    $('#privkey').val(privateKey);
    $('#pubkey').val(publicKey);

    const key = await openpgp.readKey({ armoredKey: publicKey });
    $('#key_short_id').val(key.getKeyID().toHex().slice(-8).toUpperCase());

    // Enable download buttons
    $('#download_priv_key').removeClass('disabled');
    $('#download_pub_key').removeClass('disabled');

    // Enable button once again (NOTE: user should refresh to re-gen)
    $('#generate_keys_btn').removeClass("disabled");
    $('#generate_keys_btn').removeClass("btn-primary").addClass("btn-success");
    $('#generate_keys_btn').val("Finished");
    $('#start_again_btn').removeClass("hide").fadeIn();
}

/**
 * Download public key as a base64 encoded value.
 */
var calcSubkeySize = function(algo, bitlength) {
    if (algo == 'rsa') {
        // Return the same exact bitlength for RSA subkeys
        return bitlength;
    } else if (algo == 'ecc') {
        // For ECC the subkeys should be smaller
        switch (bitlength) {
            case 256:
                return 163;
            case 384:
                return 256;
            case 512:
                return 384;
            default:
                _debug("ERROR: Unexpected bitlength found for ECC algorithm!");
                return 0;
        }
    } else {
        _debug("ERROR: Unexpected algorithm found!");
        return 0;
    }
}

/**
 * Populate dropdown key size menu.
 */

var populateKeysizeDropdown = function() {

    /* Accepted RSA key sizes */
    rsa_bitlengths = [{
            "value": "",
            "class": "disabled",
            "text": "Select key size...",
            "selected": "selected"
        },
        {
            "value": "1024",
            "class": null,
            "text": "1024 bits (good for testing purposes)",
            "selected": null
        },
        {
            "value": "2048",
            "class": null,
            "text": "2048 bits (secure)",
            "selected": null
        },
        {
            "value": "4096",
            "class": null,
            "text": "4096 bits (more secure) [Recommended]",
            "selected": null
        },
        {
            "value": "8192",
            "class": null,
            "text": "8192 bits (super secure, super slow)",
            "selected": null
        },
    ]

    /* Accepted ECC key sizes */
    ecc_bitlengths = [{
            "value": "",
            "class": "disabled",
            "text": "Select key size...",
            "selected": "selected"
        },
        //{"value": "163", "class":null, "text":"163 bits (good for testing purposes)", "selected":null},
        //{"value": "256", "class":null, "text":"256 bits (secure)", "selected":null},
        {
            "value": "384",
            "class": null,
            "text": "384 bits (secure)",
            "selected": null
        },
        //{"value": "512", "class":null, "text":"512 bits (even more secure)", "selected":null},
    ]

    /* Empty existing dropdown list */
    $("#bitlength > option").each(function() {
        $(this).remove();
    });

    /* Re-populate */
    var option_list = $("#bitlength");
    var picked_algorithm = $("#algorithm").val();
    var option;

    if (picked_algorithm == 'rsa') {
        $.each(rsa_bitlengths, function(index, option) {
            //console.log(option);
            $('<option />', {
                value: option['value'],
                text: option['text'],
                class: option['class'],
                selected: option['selected']
            }).appendTo(option_list);
        });
    } else if (picked_algorithm == 'ecc') {
        $.each(ecc_bitlengths, function(index, option) {
            //console.log(option);
            $('<option />', {
                value: option['value'],
                text: option['text'],
                class: option['class'],
                selected: option['selected']
            }).appendTo(option_list);
        });
    }
}

/**
 * Download public key as a base64 encoded value.
 */
var downloadPubKey = function() {

    var blob = new Blob([$('#pubkey').val()], {
        type: "text/plain;charset=utf-8"
    });
    saveAs(blob, "0x" + $('#key_short_id').val() + "-pub.asc");

    return false;
}

/**
 * Download private key as a base64 encoded value.
 */
var downloadPrivKey = function() {

    var blob = new Blob([$('#privkey').val()], {
        type: "text/plain;charset=utf-8"
    });
    saveAs(blob, "0x" + $('#key_short_id').val() + "-sec.asc");

    return false;
}