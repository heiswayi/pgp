# pgp
A simple and easy to use client-side PGP key generator

**URL:** http://heiswayi.github.io/pgp/

## About this program

Pretty Good Privacy (PGP) is a data encryption and decryption computer program that provides cryptographic privacy and authentication for data communication. PGP is often used for signing, encrypting, and decrypting texts, e-mails, files, directories, and whole disk partitions and to increase the security of e-mail communications. It was created by Phil Zimmermann in 1991. PGP and similar software follow the OpenPGP standard (RFC 4880) for encrypting and decrypting data. _Source: [Wikipedia](https://en.wikipedia.org/wiki/Pretty_Good_Privacy)_

This website only provides a simple and easy to use tool for people to generate PGP keys with. Today, the common methods for generating keys still involve going to a command prompt of a Linux/Unix machine and using the GPG utility, or installing a PGP compatible application on your desktop. I wanted to provide an easier way to generate keys. None of this would be possible without the awesome Open Source software I'm utilizing. I'm using [KeyBase's](https://keybase.io/) awesome JavaScript implementation of PGP ([kbpgp](https://github.com/keybase/kbpgp)). For file saving capabilities I am utilizing [Eli Grey's](https://github.com/eligrey) wonderful [FileSaver.js](https://github.com/eligrey/FileSaver.js/) interface.

If you have any inquiry, just [create an issue here](https://github.com/heiswayi/pgp/issues/new).

## Frequently Asked Questions

**Is it safe for me to generate my PGP keys through your website?**

> Yes, it is as safe as generating your keys using a local application. The key generation on this website is done client-side only. This means the key pairs are generated entirely in your web browser and they never leave your computer. This website never sees any key related data or the key itself.

**Can you tell me more about the keys that the program generates?**

> Sure. For starters, it enforces using a passphrase with each key generated. This ensures some level of protection if your key is ever stolen. It also automatically generates two subkeys for you, one for signing and the other for encryption. You can use your subkeys to sign and encrypt data and keep your private key safe. The bit length of generated subkeys will be identical to the length you specified for the primary key. The primary key it generates for you never expires. You can, however, set the expiration date on the generated subkeys using the 'Expire' option in the key generation form.

**What is Elliptic Curve Cryptography?**

> Elliptic Curve Cryptography (ECC) is an approach to public-key cryptography based on the algebraic structure of elliptic curves over finite fields. One of the main benefits in comparison with non-ECC cryptography (with plain Galois fields as a basis) is the same level of security provided by keys of smaller size. For example, a 256-bit ECC public key should provide comparable security to a 3072-bit RSA public key. ECC is still not widely supported in many PGP client applications so I advise that you generate ECC keys only if you know what you're doing. You can read more about it at [RFC 6637](http://tools.ietf.org/html/rfc6637).

**I'm concerned about my privacy. Do you keep or gather logs of any sort?**

> No, I don't keep or log any information you submitted through the generator form. The only logging that occurs when you visit this website is performed by Google Analytics, which helps me keep track of the number of people visiting the site monthly.

**Why does my web browser or computer slow down when I'm generating keys?**

> PGP key generation is a resource intensive process. As a result, your may experience increased CPU and memory usage on your device, which can result in performance issues. The performance impact depends on the hardware capabilities of your device.

## License

MIT License
