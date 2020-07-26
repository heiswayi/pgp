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
var genKeyPair = function() {

    // Get params from user input
    var name = $('#name').val();
    var email = $('#email').val() ? " <" + $('#email').val() + ">" : "";;
    var comments = ($('#comments').val() != "") ? " (" + $('#comments').val() + ")" : "";
    var bitlength = parseInt($('#bitlength').val());
    var algorithm = $('#algorithm').val();
    var expire = $('#expire').val();
    var passphrase = $('#passphrase').val();

    if (expire == "1") {
        var expire = 86400 * 365 * 1;
    } else if (expire == "2") {
        var expire = 86400 * 365 * 2;
    } else if (expire == "4") {
        var expire = 86400 * 365 * 4;
    } else if (expire == "8") {
        var expire = 86400 * 365 * 8;
    }

    // Set ECC flag
    var use_ecc = false;
    if (algorithm == 'ecc') {
        use_ecc = true;
    }

    // Calculate subkey size
    var subkey_bitlength = calcSubkeySize(algorithm, bitlength);

    _debug("Params:");
    _debug("Name: " + name);
    _debug("Email: " + email);
    _debug("Comments: " + comments);
    _debug("Bitlength: " + bitlength);
    _debug("Subkey Bitlength: " + subkey_bitlength);
    _debug("Algorithm: " + algorithm);
    _debug("Expire: " + expire);
    _debug("use_ecc flag: " + use_ecc);
    _debug("Passphrase: " + passphrase);

    // Disable/update the action button
    _debug("Update buttons");
    $('#generate_keys_btn').css('pointer-events', 'none');
    $('#generate_keys_btn').addClass("disabled");
    $('#generate_keys_btn').val("Generating .");

    // Create a progress hook
    var my_asp = new kbpgp.ASP({
        progress_hook: function(o) {

            _debug("progress_hook received: " + o);
            var btn_update_ts = $('#btn_update_ts');

            // If last button update was less than 500ms ago we skip
            if ((Date.now() - btn_update_ts.val()) < 500) {
                return;
            }

            // Else we continue to update button text
            var btn = $('#generate_keys_btn');

            if (btn.val() == 'Generating .') {
                btn.val('Generating ..');
            } else if (btn.val() == 'Generating ..') {
                btn.val('Generating ...');
            } else {
                btn.val('Generating .');
            }

            // And we update the timestamp
            btn_update_ts.val(Date.now());
        }
    });

    var F = kbpgp["const"].openpgp;

    var opts = {
        asp: my_asp, // set progress hook
        userid: name + comments + email,
        ecc: use_ecc,
        primary: {
            nbits: bitlength,
            flags: F.certify_keys | F.sign_data | F.auth | F.encrypt_comm | F.encrypt_storage,
            expire_in: expire // never expires
        },
        subkeys: [{
            nbits: subkey_bitlength,
            flags: F.sign_data,
            expire_in: expire
        }, {
            nbits: subkey_bitlength,
            flags: F.encrypt_comm | F.encrypt_storage,
            expire_in: expire
        }, ]
    };

    _debug("Calling KeyManager.generate()");
    kbpgp.KeyManager.generate(opts, function(err, alice) {
        if (!err) {
            _debug("Callback invoked()");
            var _passphrase = $('#passphrase').val();
            // sign alice's subkeys
            alice.sign({}, function(err) {
                _debug(alice);
                $('#key_short_id').val(alice.get_pgp_short_key_id());
                _debug("KeyID: " + alice.get_pgp_short_key_id());
                // export; dump the private with a passphrase
                alice.export_pgp_private_to_client({
                    passphrase: _passphrase
                }, function(err, pgp_private) {
                    _debug("private key: " + pgp_private);
                    $('#privkey').val(pgp_private);
                    // Enable download buttons
                    $('#download_priv_key').removeClass('disabled');
                });
                alice.export_pgp_public({}, function(err, pgp_public) {
                    _debug("public key: " + pgp_public);
                    $('#pubkey').val(pgp_public);
                    // Enable download buttons
                    $('#download_pub_key').removeClass('disabled');
                });
            });
        }

        // Enable button once again (NOTE: user should refresh to re-gen)
        $('#generate_keys_btn').removeClass("disabled");
        $('#generate_keys_btn').removeClass("btn-primary").addClass("btn-success");
        $('#generate_keys_btn').val("Finished");
        $('#start_again_btn').removeClass("hide").fadeIn();
    });

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