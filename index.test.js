/* eslint-env mocha */
const assert = require('assert')

const {randomMnemonicSeed, mnemonicToSeed, checker} = require('.')

describe('Seed', () => {
  it('Stretches', () => { // S L O W
    const seed = 'possible mother domain sweet brown strategy element school february merit silver edit'
    const stretched = mnemonicToSeed(seed, 'passphrase')
    assert.equal(stretched.length, 64)
    assert.equal(stretched.toString('hex').substring(0, 8), '0c619b5d')
  })

  it('Random mnemonic seed', () => {
    assert(randomMnemonicSeed({entropy: [0], work_min: 1}))
    assert(randomMnemonicSeed({entropy: 'entropy', work_min: 1}))
    assert(randomMnemonicSeed({entropy: Buffer.from([0]), work_min: 1}))
    assert(randomMnemonicSeed({entropy: Buffer.from([0]), bits: 256, work_min: 1}))
    assert(
        randomMnemonicSeed({entropy: 'entropy', work_min: 1}) !==
        randomMnemonicSeed({entropy: 'entropy', work_min: 1})
    )
  })

  it('Invalid entropy arg type', () => {
    throws(() => randomMnemonicSeed({entropy: 2, work_min: 1}), /must be a string, buffer, or array/) // fails in browser
  })

  it('Mnemonic', () => {
    throws(() => mnemonicToSeed(), /seed string required/)
    throws(() => randomMnemonicSeed({work_min: 1}), /Provide seedCallback parameter unless you plan to provide config.entropy/)
  })

  it('Random mnemonic seed internal entropy', (done) => {
    randomMnemonicSeed({work_min: 1}, mnemonicSeed => {
      const words = mnemonicSeed.split(' ')
      assert(words.length <= 12, `A mnemonic seed with more than 12 words: ${mnemonicSeed}`)
      assert(words.length > 9, `Very odd, a seed with only ${words.length} words: ${mnemonicSeed}`)
      done()
    })
  })

})

/* istanbul ignore next */
function throws (fn, match) {
  try {
    fn()
    assert(false, 'Expecting error')
  } catch (error) {
    if (!match.test(error.message)) {
      error.message = `Error did not match ${match}\n${error.message}`
      throw error
    }
  }
}
