//Load the keys to textareas from the text files, containing PGP keys as text.
var filename, as_base64, as_binary;
var openFile = function(event, id, as_base64) {
  var input = event.target;
  var reader = new FileReader();
  reader.onload = function() {
    var text = reader.result;
    if (text.indexOf(String.fromCharCode(65533)) !== -1) {
      as_base64 = 'as_base64';
      openFile(event, id, as_base64);
      document.getElementById(id).setAttribute('readonly', true);
      document.getElementById(id).setAttribute('title',
                                               'Unsigned character was been found in the source code.\n' +
                                               'Now this content was been uploaded as base64.\n' +
                                               'You can decode original source of this - from base64.\n\n' +
                                               'Double-click here to discard readonly attribute.'
                                              );
    }
    var node = document.getElementById(id);
    if (as_base64 === 'as_base64') {
      node.value = text.split(';base64,')[1];
    } else {
      node.value = text;
    } //console.log(reader.result.substring(0, 200));
  };

  if (input.files[0] === undefined) {
    document.getElementById('filename_temp').innerHTML = 'filename.txt';
  } else {
    //set file name as temporary text in invisible div
    document.getElementById('filename_temp').innerHTML = input.files[0].name;
  }

  if (as_base64 === 'as_base64') {
    reader.readAsDataURL(input.files[0]);
    document.getElementById("filename_temp").innerHTML += '.base64.txt'
  } else {
    reader.readAsText(input.files[0]);
  }
};

function isBase64(str) {
  try {
    return btoa(atob(str)) == str;
  } catch (err) {
    return false;
  }
}

$(document).ready(function() {
  /* Dynamic key size menus */
  $('#algorithm').change(function() {
    populateKeysizeDropdown();
    $('#bitlength').removeAttr('disabled');
  });

  /* Set event handlers */
  $('form#keygen').submit(function(e) {
    e.preventDefault();
    genKeyPair();
  });

  $('#download_priv_key').on('click', downloadPrivKey);
  $('#download_pub_key').on('click', downloadPubKey);

  $('#name, #email, #comments, #algorithm, #bitlength, #expire, #passphrase').tooltip({
    trigger: 'hover',
    placement: 'top'
  });

  $('[data-toggle="popover"]').popover({
    placement: 'top'
  });

  //discard readonly attribute by double-click on textarea
  $("#sign-plain-text").dblclick(function() {
    $(this).removeAttr("title");
    $(this).removeAttr("readonly");
  });

  // SIGN
  var signButton = $("#sign-button");

  signButton.click(async function() {
    var signPlainText = $("#sign-plain-text").val();
    var signedText = $("#signed-text");
    var signPrivateKey = $("#sign-private-key").val();
    var signPassphrase = $("#sign-passphrase").val();

    $('#vrAlert_signed').empty();
    var clone = $('#vrError').clone();

    try {
        const privateKey = await openpgp.readPrivateKey({ armoredKey: signPrivateKey });
        const decryptedPrivateKey = await openpgp.decryptKey({
            privateKey,
            passphrase: signPassphrase
        });

        const signature = await openpgp.sign({
            message: await openpgp.createMessage({ text: signPlainText }),
            signingKeys: decryptedPrivateKey
        });

        signedText.val(signature);
        const downloadLink = $('#download-signed-text');
        const blob = new Blob([signature], { type: 'text/plain' });
        downloadLink.attr('href', URL.createObjectURL(blob));
        downloadLink.attr('download', 'signed-message.asc');
        downloadLink.show();

        clone = $('#vrSuccess').clone();
        clone.find('#vrAddrLabel').html("Message successfully signed.");
        clone.appendTo($('#vrAlert_signed'));
    } catch (err) {
        console.log("Error" + err);
        clone.find('#vrAddrLabel').html(err.message);
        clone.appendTo($('#vrAlert_signed'));
    }
  });
  //end Sign

  // Verify signature
  var VerifyButton = $("#verify-signature");

  VerifyButton.click(async function() {
    var signPlainText = $("#sign-plain-text").val();
    var signedText = $("#signed-text");
    var SignerPublicKey = $("#Signer-public-key").val();

    $('#vrAlert_signed').empty();
    var clone = $('#vrError').clone();

    try {
        const publicKey = await openpgp.readKey({ armoredKey: SignerPublicKey });
        const verificationResult = await openpgp.verify({
            message: await openpgp.readMessage({ armoredMessage: signPlainText }),
            verificationKeys: publicKey
        });
        const { verified, keyID } = verificationResult.signatures[0];
        await verified; // throws on invalid signature
        signedText.val(verificationResult.data);
        const downloadLink = $('#download-signed-text');
        const blob = new Blob([verificationResult.data], { type: 'text/plain' });
        downloadLink.attr('href', URL.createObjectURL(blob));
        downloadLink.attr('download', 'verified-message.txt');
        downloadLink.show();
        clone = $('#vrSuccess').clone();
        clone.find('#vrAddrLabel').html("Message signature is verified with key ID: " + keyID.toHex());
        clone.appendTo($('#vrAlert_signed'));
    } catch (err) {
        console.log("Error" + err);
        clone.find('#vrAddrLabel').html(err.message);
        clone.appendTo($('#vrAlert_signed'));
    }
  });
  //end Verify signature

  // SIGN+Encrypt
  var signencryptButton = $("#signencrypt-button");

  signencryptButton.click(async function() {
    //encrypt by pub, then sign by priv
    var signPlainText = $("#sign-plain-text").val();
    var signedText = $("#signed-text");
    var signPrivateKey = $("#sign-private-key").val();
    var signPassphrase = $("#sign-passphrase").val();
    var SignerPublicKey = $("#Signer-public-key").val();


    $('#vrAlert_signed').empty();
    var clone = $('#vrError').clone();

    try {
        const publicKey = await openpgp.readKey({ armoredKey: SignerPublicKey });
        const privateKey = await openpgp.readPrivateKey({ armoredKey: signPrivateKey });
        const decryptedPrivateKey = await openpgp.decryptKey({
            privateKey,
            passphrase: signPassphrase
        });

        const encrypted = await openpgp.encrypt({
            message: await openpgp.createMessage({ text: signPlainText }),
            encryptionKeys: publicKey,
            signingKeys: decryptedPrivateKey
        });
        signedText.val(encrypted);
        const downloadLink = $('#download-signed-text');
        const blob = new Blob([encrypted], { type: 'text/plain' });
        downloadLink.attr('href', URL.createObjectURL(blob));
        downloadLink.attr('download', 'encrypted-message.asc');
        downloadLink.show();
        clone = $('#vrSuccess').clone();
        clone.find('#vrAddrLabel').html("Message successfully encrypted and signed.");
        clone.appendTo($('#vrAlert_signed'));
    } catch (err) {
        console.log("Error" + err);
        clone.find('#vrAddrLabel').html(err.message);
        clone.appendTo($('#vrAlert_signed'));
    }
  });
  //end SIGN+ENCRYPT

  // DECRYPTION(+VERIFY)
  var decryptionButton = $("#decryption-button");

  decryptionButton.click(async function() {
    //first, verify signature by pub, then decrypt by priv.
    var signPlainText = $("#sign-plain-text").val();
    var signedText = $("#signed-text");
    var signPrivateKey = $("#sign-private-key").val();
    var signPassphrase = $("#sign-passphrase").val();
    var SignerPublicKey = $("#Signer-public-key").val();

    $('#vrAlert_signed').empty();
    var clone = $('#vrError').clone();

    try {
        const privateKey = await openpgp.readPrivateKey({ armoredKey: signPrivateKey });
        const decryptedPrivateKey = await openpgp.decryptKey({
            privateKey,
            passphrase: signPassphrase
        });

        const publicKey = await openpgp.readKey({ armoredKey: SignerPublicKey });

        const { data, signatures } = await openpgp.decrypt({
            message: await openpgp.readMessage({ armoredMessage: signPlainText }),
            decryptionKeys: decryptedPrivateKey,
            verificationKeys: publicKey
        });

        signedText.val(data);
        const downloadLink = $('#download-signed-text');
        const blob = new Blob([data], { type: 'text/plain' });
        downloadLink.attr('href', URL.createObjectURL(blob));
        downloadLink.attr('download', 'decrypted-message.txt');
        downloadLink.show();

        const { verified, keyID } = signatures[0];
        await verified; // throws on invalid signature

        clone = $('#vrSuccess').clone();
        clone.find('#vrAddrLabel').html("Message is decrypted, and signature is verified successfully with key ID " + keyID.toHex());
        clone.appendTo($('#vrAlert_signed'));
    } catch (err) {
        console.log("Error" + err);
        clone.find('#vrAddrLabel').html(err.message);
        clone.appendTo($('#vrAlert_signed'));
    }
  });
  //END Decryption(+Verify)
});