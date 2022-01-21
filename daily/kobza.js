/*
TODO:
- Tutorial show on first
- Button show tutorial
- Share
*/

if (!window.VALID_WORDS) {
  window.VALID_WORDS = ['срака']
  console.error('Word list have not loaded properly')
} else {
  console.log('Legal words are here, mate')
}

const LetterState = {
  standard: 'Standard',
  disabled: 'Disabled',
  green: 'Green',
  yellow: 'Yellow'
};

let Wotd = {
  word: 'кобза'
}

class Letter {
  constructor(char) {
    this.char = char
    this.state = LetterState.standard
  }
}

class EmptyLetter {
  constructor() {
    this.char = ''
    this.state = LetterState.standard
  }
}

const GUESS_LENGTH = 5

class Guess {
  constructor() {
    this.letters = []
  }

  addLetter(char) {
    if (this.letters.length >= GUESS_LENGTH) {
      // Нічого не робимо, букви не додаються
    } else {
      let letter = new Letter(char)
      this.letters.push(letter)
    }
  }

  compare(root) {
    if (this.letters.length != GUESS_LENGTH) {
      console.error('Incorrect button press')
      return false
    }
    if (window.VALID_WORDS.indexOf(this.letters.map(l => l.char).join('')) < 0) {
      console.error('Incorrect word')
      alert('Тупе слово')
      return false
    }
    let rightLetters = Wotd.word.split('')
    let otherLetters = []
    let greenCount = 0
    for (let i=0; i<GUESS_LENGTH; i++) {
      let char = rightLetters[i]
      let letter = this.letters[i]
      if (letter.char == char) {
        greenCount++
        root.$emit('keystate', char, LetterState.green)
        letter.state = LetterState.green
      } else {
        otherLetters.push(char)
      }
    }
    if (greenCount == GUESS_LENGTH) {
      this.success()
      return false
    }
    for (let i=0; i<GUESS_LENGTH; i++) {
      let letter = this.letters[i]
      if (letter.state == LetterState.green) {
        continue
      }
      if (otherLetters.indexOf(letter.char) >= 0) {
        root.$emit('keystate', letter.char, LetterState.yellow)
        letter.state = LetterState.yellow
      } else {
        root.$emit('keystate', letter.char, LetterState.disabled)
        letter.state = LetterState.disabled
      }
    }
    return true
  }

  backspace() {
    this.letters.pop()
  }

  success() {
    alert('ВГАДАЛОСЬ!')
  }

  getLetters() {
    let result = []
    for (let i=0; i<GUESS_LENGTH; i++) {
      if (i<this.letters.length) {
        result.push(this.letters[i])
      } else {
        result.push(new EmptyLetter())
      }
    }
    return result
  }
}

Vue.component('letter', {
  props: ['letter'],
  computed: {
    letterClass: function() {
      let result = ""
      switch(this.letter.state) {
        case LetterState.standard: result += 'bg-kolor'; break;
        case LetterState.disabled: result += 'bg-kdisabled'; break;
        case LetterState.yellow: result += 'bg-kellow'; break;
        case LetterState.green: result += 'bg-kreen'; break;
      }
      if (this.letter.char.length > 0) {
        result += " b--white"
      } else {
        result += " b--near-white"
      }
      return result
    }
  },
  template: `
  <div class='letter w2 h2 fl mh1 tc white ba br2' :class="letterClass">
  {{letter.char}}
  </div>
  `
})

Vue.component('keyletter', {
  props: ['letter'],
  computed: {
    letterClass: function() {
      switch(this.letter.state) {
        case LetterState.standard: return 'bg-kstandard'
        case LetterState.disabled: return 'bg-kdisabled'
        case LetterState.yellow: return 'bg-kellow'
        case LetterState.green: return 'bg-kreen'
      }
    }
  },
  methods: {
    press: function() {
      this.$root.$emit('pressed', this.letter.char)
    }
  },
  template: `
  <div class='letter w1 h2 fl tc br2' :class="letterClass" v-on:click="press">
    {{letter.char}}
  </div>
  `
})

Vue.component('guess', {
  props: ['guess'],
  template: `
  <div class='guess w-80 center flex justify-center'>
    <letter v-for="letter in guess.getLetters()" v-bind:letter="letter"></letter>
  </div>
  `
})

Vue.component('field', {
  data: function() {
    return {
      guesses: [
        new Guess(),
        new Guess(),
        new Guess(),
        new Guess(),
        new Guess(),
        new Guess()
      ],
      currentGuess: 0
    }
  },
  methods: {
    addChar: function(char) {
      this.guesses[this.currentGuess].addLetter(char)
    },
    forward: function() {
      let guess = this.guesses[this.currentGuess]
      if (guess.compare(this.$root)) {
        this.currentGuess++
      }
    },
    back: function() {
      let guess = this.guesses[this.currentGuess]
      guess.backspace()
    }
  },
  mounted: function() {
    this.$root.$on('pressed', function(char) {
      this.addChar(char)
    }.bind(this))
    this.$root.$on('forward', function() {
      this.forward()
    }.bind(this))
    this.$root.$on('back', function() {
      this.back()
    }.bind(this))
  },
  template: `
  <div class="vh-75 pa3" id="field">
    <guess v-for="guess in guesses" v-bind:guess="guess"></guess>
  </div>
  `
})

Vue.component('keyboard', {
  methods: {
    back: function() {
      this.$root.$emit('back')
    },
    forward: function() {
      this.$root.$emit('forward')
    },
    button: function(char) {
      console.log(char)
    },
    updateLetter(char, incomingState) {
      let letter = this.keys[char]
      if (letter.state == LetterState.green) {
        return
      } else {
        if (incomingState == LetterState.disabled && letter.state != LetterState.standard) {
          return
        }
        letter.state = incomingState
      }
    }
  },
  mounted: function() {
    this.$root.$on('keystate', function(char, state) {
      this.updateLetter(char, state)
    }.bind(this))
  },
  data: function() {
    const KEYS = [["й", "ц", "у", "к", "е", "н", "г", "ґ", "ш", "щ", "з", "х"],
                  ["ф", "і", "ї", "в", "а", "п", "р", "о", "л", "д", "ж", "є"],
                  ["я", "ч", "с", "м", "и", "т", "ь", "б", "ю"]]
    let keys = {}
    for (let i=0; i<KEYS.length; i++) {
      let row = KEYS[i]
      for (let j=0; j<row.length; j++) {
        let char = row[j]
        keys[char] = new Letter(char)
      }
    }

    return {
      char: '',
      keys: keys,
      KEYS: KEYS
    }
  },
  template: `
  <div class="vh-25" id="keyboard">
    <div class="flex w-90 center flex justify-center pv1">
      <div v-for="key in KEYS[0]" class="fl w1 white mh1">
        <keyletter v-bind:letter="keys[key]"></keyletter>
      </div>
    </div>
    <div class="flex w-90 center flex justify-center pv1">
      <div v-for="key in KEYS[1]" class="fl w1 white mh1">
        <keyletter v-bind:letter="keys[key]"></keyletter>
      </div>
    </div>
    <div class="flex w-90 center flex justify-center pv1">
      <div v-on:click="back" class="letter w1 h2 fl br2 white bg-kstandard mh1"><-</div>
      <div v-for="key in KEYS[2]" class="fl w1 white mh1">
        <keyletter v-bind:letter="keys[key]"></keyletter>
      </div>
      <div v-on:click="forward" class="letter w1 h2 fl br2 white bg-kstandard mh1">-></div>
    </div>
  </div>
  `
})


var game = new Vue({
  el: '#game',
  template: `
  <div>
    <field></field>
    <keyboard></keyboard>
  </div>
  `
})