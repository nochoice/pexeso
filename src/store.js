import { createStore } from 'vuex';

const timeout = (ms) =>  new Promise(resolve => setTimeout(resolve, ms));

export default createStore({
    state () {
      return {
        count: 0,
        state: 'home',
        size: {
            x: 4, y: 4
        },
        cardsInit: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
        cards: [],
        cardsShuffled: [],
        cardsFlipped: [],
        cardsFound: []
      }
    },
    getters: {
        canTurn: (state) => state.cardsFlipped.length < 2,
        isFullHand: (state) => state.cardsFlipped.length === 2,
        isGameOver: (state) => state.cardsShuffled.length === state.cardsFound.length ,
        isCardFlipped: (state) => (position) =>  state.cardsFlipped.includes(position),
        isCardFound: (state) => (position) =>  state.cardsFound.includes(position),
        areFlippedCardsSame: (state) => state.cardsShuffled[state.cardsFlipped[0]] === state.cardsShuffled[state.cardsFlipped[1]]

    },
    mutations: {
      increment (state) {
        state.count++
      },
      clearFlipped(state) {
          state.cardsFlipped = []
      },
      clearFound(state) {
        state.cardsFound = []
      },
      clearCards(state) {
        state.cards = []
      },
      selectCards(state) {
        const size = (state.size.x * state.size.y) / 2; 

        state.cards = [...state.cardsInit]
                            .sort(() => Math.random() - 0.5)
                            .sort(() => Math.random() - 0.5)
                            .slice(0, size)
      },
      shuffle(state) {
          console.log(state.cards);
        state.cardsShuffled = [...state.cards, ...state.cards]
                                        .sort(() => Math.random() - 0.5)
                                        .sort(() => Math.random() - 0.5);
      },
      cardFlip(state, position) {
          state.cardsFlipped.push(position);
      },
      cardsFound(state, cardsPositions) {
          state.cardsFound = [...state.cardsFound, ...cardsPositions];
          console.log(state.cardsFound);
      },
      setSize(state, {x, y}) {
          state.size = {x, y};
      },
      setState(state, st) {
        state.state = st
      }
    },
    actions: {
        shuffle({commit}) {
            commit('clearCards');
            commit('selectCards');
            commit('shuffle');
            commit('clearFlipped');
            commit('clearFound');
        },
        async cardFlip({ commit, getters, dispatch }, position) {
            
            if (!getters.canTurn 
                || getters.isCardFlipped(position) 
                || getters.isCardFound(position)) return;

            commit('cardFlip', position);

            if (!getters.isFullHand) return;

            getters.areFlippedCardsSame 
                    ? dispatch('flippedCardsSame')
                    : dispatch('flippedCardsNotSame');
        },

        async flippedCardsSame({commit, state, getters, dispatch}) {
            await timeout(500);

            commit('cardsFound', state.cardsFlipped);
            commit('clearFlipped');

            if(getters.isGameOver) {
                dispatch('gameOver');
            }
        },
        async flippedCardsNotSame({commit}) {
            await timeout(1000);
            
            commit('clearFlipped');
        },

        setSize({dispatch, commit}, size) {
            commit('setSize', size);
            dispatch('shuffle');
        },
        play({commit}) {
            commit('setState', 'is-playing')
        },
        gameOver({commit}) {
            commit('setState', 'game-over')
        },
        home({commit}) {
            commit('setState', 'home')
        }
    
    }
  })