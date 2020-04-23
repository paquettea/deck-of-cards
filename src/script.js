let prefix = Deck.prefix;
let transform = prefix('transform');
let translate = Deck.translate;
let deck = Deck(false);
let onTouch = () => {
  //this === card;
};
deck.cards.forEach( (card, index) => {
    card.enableDragging();
    card.enableFlipping();
    card.$el.addEventListener('mousedown', onTouch.bind(card));
    card.$el.addEventListener('touchstart', onTouch.bind(card));
});
deck.mount(document.getElementById("container"));
deck.intro();


const playerStatus = {
  FOLDED: 'folded',
  IN_HAND: 'in-hand',
  ALL_IN: 'all-in'
};

const store = new Vuex.Store({
  state: {
    minBuyIn: 5,
    maxBuyIm: 20,
    smallBlind: 0.25,
    bigBlind: 0.25,
    players: [],
    nextToAct: null,
    foldedPlayers: []
  }
});

// Table 
const table = new Vue({
  el: '#table',
  data: {
    players: []
  },
  methods: {
    addPlayer(player) {
      this.players.push(player);
    },
    removePlayer(index) {
      this.players.splice(index, 1);
    },
    startHand() {
      this.setNextToAct();
      this.$refs.playersRef.forEach(player => {
        if (player.stack > 0) {
          player.play();
        }
      })
    },
    setNextToAct() {
      store.state.nextToAct = this.getNextPosition();
    },
    getNextPosition() {
      const isNotSet = store.state.nextToAct === null;
      const isLastOfArray = store.state.nextToAct + 1 === this.players.length;
      return isNotSet || isLastOfArray ? 0 : store.state.nextToAct + 1;
    }
  },
  computed: {
    canStartHand() {
      return this.players.length > 1;
    }
  }
});


// Player component
Vue.component('player', {
  props: ['name', 'startingStack', 'position'],
  data() {
    return {
      status: playerStatus.WAITING,
      stack: this.startingStack
    }
  },
  template: `
    <div class="player">
      <div>
        {{ name }} - {{ stack }}$
        <b class="status" v-if="status == 'folded'">FOLDED</b>
      </div>
      <div class="actions">
        <button class="btn-action" @click="fold()" :disabled="!isInHand || !isNextToAct">Fold</button>
        <button class="btn-action" @click="bet(2)" :disabled="!isInHand || !isNextToAct">Bet 2$</button>
      </div>
      <div v-if="isNextToAct" class="next-to-act"></div>
    </div>  
  `,
  methods: {
    play() {
      this.status = playerStatus.IN_HAND;
    },
    fold() {
      this.status = playerStatus.FOLDED;
      store.state.foldedPlayers.push(this.position);
      this.$emit('played', 'fold');
    },
    allIn() {
      this.status = playerStatus.ALL_IN;
      this.$emit('played', 'all in');
    },
    bet(amount) {
      const isAllIn = amount >= this.stack;
      const betAmount = isAllIn ? this.stack : amount;

      if (isAllIn) {
        this.allIn();
      }

      this.stack -= betAmount;
      this.$emit('played', 'bet');
    }
  },
  computed: {
    isNextToAct() {
      return this.position === store.state.nextToAct;
    }, 
    isInHand() {
      return this.status != playerStatus.FOLDED;
    }
  }
});


// Create players form
const playersForm = new Vue({
  el: '#players-form',
  data: {
    name: '',
    stack: ''
  },
  methods: {
    onSubmit() {
      table.addPlayer({
        name: this.name,
        stack: this.stack
      });

      this.name = '';
      this.stack = '';
    }
  }
});
