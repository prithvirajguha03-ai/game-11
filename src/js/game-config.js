/*
 * Game specific difficulty configuration for "Memory Sequence".
 *
 * The shared layer (src/js/difficulty.js) owns the levels, validation and the
 * session. This file only says what each level means for THIS game:
 *
 *   boxCount / gridColumns  - how big and how crowded the board is
 *   startLength            - how many boxes the first round lights up
 *   lengthStep             - how much longer every following round gets
 *   boxMs / gapMs          - how long a box stays lit, and the pause between boxes
 *   lives                  - how many wrong answers end the run
 *
 * Every value moves in the same direction across the three levels, so the
 * choice always feels like it changed something.
 */
(function (global) {
  'use strict';

  var GAME_ID = 'memory-sequence';

  global.MemorySequenceGame = { id: GAME_ID };

  global.GameDifficulty.registerGame(GAME_ID, {
    title: 'Memory Sequence',
    startLabel: 'Start Game',
    backLabel: 'Back',

    copy: {
      title: 'Choose Your Difficulty',
      subtitle: 'Choose how hard you would like today\'s memory game to be.',
      options: {
        easy: {
          label: 'Easy',
          description: 'Relaxed pace. 4 boxes, slow flashes and 3 tries.'
        },
        normal: {
          label: 'Normal',
          description: 'Balanced challenge. 6 boxes at a friendly speed.'
        },
        hard: {
          label: 'Hard',
          description: 'More challenging. 9 boxes, quick flashes, longer order.'
        }
      }
    },

    difficulties: {
      easy: {
        boxCount: 4,
        gridColumns: 2,
        startLength: 2,
        lengthStep: 1,
        boxMs: 1200,
        gapMs: 600,
        lives: 3
      },
      normal: {
        boxCount: 6,
        gridColumns: 3,
        startLength: 3,
        lengthStep: 1,
        boxMs: 1000,
        gapMs: 350,
        lives: 1
      },
      hard: {
        boxCount: 9,
        gridColumns: 3,
        startLength: 4,
        lengthStep: 1,
        boxMs: 700,
        gapMs: 250,
        lives: 1
      }
    }
  });
})(typeof window !== 'undefined' ? window : this);
