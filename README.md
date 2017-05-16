[![Build Status](https://travis-ci.org/jcalfee/bip39-seeder.svg?branch=master)](https://travis-ci.org/jcalfee/bip39-seeder)
[![Coverage Status](https://coveralls.io/repos/github/jcalfee/bip39-seeder/badge.svg?branch=master)](https://coveralls.io/github/jcalfee/bip39-seeder?branch=master)

[NPM Package](https://www.npmjs.com/package/bip39-seeder)

# Seeder (bip39)

Create and validate bip39 compatible mnemonic seeds.

## Entropy

Combines secure random generator and variations in CPU performance.

## Validation

Mnemonic seeds contain a hidden checksum.  Suggested spelling corrections are provided.

## Command Line Interface

```bash
bip39-seeder -?

Create or validate bip39 mnemonic seeds.
> ocean earn race rack swing odor yard manage illegal draw window desk

Suggested spelling corrections are provided.

Options:
  --create, -c    Create a new secure random mnemonic seed             [boolean]
  --seed, -s      Provide mnemonic seed (12 words or so)
                                                        [string] [default: null]
  --bits, -b      Bit strength                           [number] [default: 128]
  --language, -l  language: chinese_simplified, chinese_traditional, english,
                  french, italian, japanese, spanish
                                                   [string] [default: "english"]
  --no-suggest    Do not suggest correction to misspelled words in the mnemonic
                  seed                                [boolean] [default: false]
  --help, -h, -?  Show help                                            [boolean]

Examples:
  bip39-seeder -c  Create a new random mnemonic seed
  bip39-seeder -s  Validate an existing seed

```

## API

```javascript
const assert = require('assert')
const {suggest, validSeed} = require('bip39-checker')
const {randomMnemonicSeed, mnemonicToSeed} = require('bip39-seeder')

randomMnemonicSeed(null, seed => {

    assert(validSeed(seed))

    // Strengthen the seed by 11 bits
    const stretched = mnemonicToSeed(seed)
    assert(stretched.toString('hex'))
    assert.equal(stretched.length, 64)
    // By convention:
    //  stretched.slice(0, 32) is the private key or HD master private key, etc..
    //  stretched.I.slice(32) may be used for something else like an initialization vector, chain code, etc..

    console.log('Random mnemonic seed:', seed)
})
```
