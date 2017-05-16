const MoreEntropy = require('more-entropy')
const randomBytes = require('randombytes')
const createHash = require('create-hash')
const checker = require('bip39-checker')
const {normalize, validWordlist, bip39} = checker

module.exports = {
  randomMnemonicSeed,
  mnemonicToSeed,
  /** @module bip39-checker */
  checker
}

/**
    Create a random mnemonic seed.  This can be 12 random private words used to derive private keys.  This package uses the bip39 word list and package to create the actual seed but adds additional entropy.  This mnemonic seed contains a checksum used to check the mnemonic seed against typing errors.  Before deriving private keys see the mnemonicToSeed function.

    <p>randomMnemonicSeed calls bip39.generateMnemonic

    @see mnemonicToSeed(mnemonicSeed)

    If additional entropy is not provided, the 'more-entropy' package is used and combined with the devices secureRandom number generator.

    @see https://www.npmjs.com/package/more-entropy
    @see https://www.npmjs.com/package/secure-random

    @arg {Array|Buffer|string} config.entropy - Any size Buffer or String but at least 128 bits are recommended. Additional entropy combined with secureRandom (@see https://github.com/keybase/more-entropy)

    @arg {function} [seedCallback = null] - Called when seed is available.

    @arg {object} [config = {}]
    @arg {number} [config.bits = 128] - Bit strength.
    @arg {number} [config.work_min = 5] - Higher value uses more CPU cycles when gathering entropy.
    @arg {string} [config.language = 'english'] - chinese_simplified, chinese_traditional, english, french, italian, japanese, spanish

    @example seeder.randomMnemonicSeed(null, mnemonicSeed => {...})

    @return {string} undefined (seedCallback will be called instead) or if custom entropy is provided returns a new mnemonic seed.
*/
function randomMnemonicSeed (config, seedCallback) {
  config = config || {}
  const {bits = 128, language = 'english', work_min = 5} = config
  let {entropy} = config

  const bytes = Math.ceil(bits / 8)

  if (!entropy) {
    if (!seedCallback) {
      throw new TypeError('Provide seedCallback parameter unless you plan to provide config.entropy')
    }
    const moreEntropy = new MoreEntropy.Generator({work_min})
    moreEntropy.generate(Math.max(bits, 128), newEntropy => {
      moreEntropy.stop()
      seedCallback(
        randomMnemonicSeed(Object.assign(config, {entropy: newEntropy}), seedCallback)
      )
    })
    return
  }
  let seedBuf = randomBytes(bytes)

  try {
    if (Array.isArray(entropy)) {
      // preserve entropy for array elements with a value over 255
      // require('assert').equal(entropy.length * 4, Buffer.from(new Int32Array(entropy).buffer).length)
      entropy = Buffer.from(new Int32Array(entropy).buffer)
    }
    seedBuf = createHash('sha256').update(entropy).update(seedBuf).digest().slice(0, bytes)
  } catch (err) {
    if (/string or a buffer/.test(err.message)) {
      throw new TypeError('entropy parameter must be a string, buffer, or array')
    }
    throw err
  }
  const wordlist = validWordlist(language)
  const mnemonicSeed = bip39.generateMnemonic(bits, rng => seedBuf, wordlist)
  return mnemonicSeed
}

/**
    Stretching can be done prior to deriving private keys.  Adds 11 bits of entropy to compensate for the version.

    @arg {string} mnemonicSeed
    @arg {string} passphrase - All passphrases are valid but a correct or consistent passphrase is required to derive the same mnemonic seed.  Lost passphrases are not recoverable.  An empty string is used if no passphrase is provided.

    @example seeder.mnemonicToSeed(mnemonicSeed)

    @return {Buffer} 64 bytes (512 bits)
*/
function mnemonicToSeed (mnemonicSeed, passphrase = '') {
  if(passphrase == null) passphrase = '' // null parameter (instead of undefined)
  mnemonicSeed = normalize(mnemonicSeed)
  return bip39.mnemonicToSeed(mnemonicSeed, passphrase)
}
