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


const table = new Vue({
  el: '#table',
  data: {
    minBuyIn: 5,
    maxBuyIm: 20,
    smallBlind: 0.25,
    bigBlind: 0.25,
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
      this.$refs.playersRef.forEach(player => {
        if (player.stack > 0) {
          player.play();
        }
      })
    }
  }
});

Vue.component('player', {
  props: ['name', 'startingStack'],
  data() {
    return {
      status: playerStatus.WAITING,
      stack: this.startingStack
    }
  },
  template: `
    <div>
      <div class="player">
        {{ name }} - {{ stack }}$ 
      </div>
      <div class="actions">
        <button class="btn-action" @click="fold()" :disabled="status != 'in-hand'">Fold</button>
        <button class="btn-action" @click="bet(2)" :disabled="status != 'in-hand'">Bet 2$</button>
      </div>
    </div>  
  `,
  methods: {
    play() {
      this.status = playerStatus.IN_HAND;
    },
    fold() {
      this.status = playerStatus.FOLDED;
    },
    allIn() {
      this.status = playerStatus.ALL_IN;
    },
    bet(amount) {
      const betAmount = amount < this.stack ? amount : this.stack;
      this.stack -= betAmount;
    }
  }
});


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
        stack: this.stack,
        status: playerStatus.WAITING
      });

      this.name = '';
      this.stack = '';
    }
  }
});
