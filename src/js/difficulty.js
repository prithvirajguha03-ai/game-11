/*
 * Shared difficulty layer (framework free, reusable by every game).
 *
 * Responsibilities:
 *   - one canonical list of difficulty levels ("easy" | "normal" | "hard")
 *   - validation / normalisation so games never crash on a bad value
 *   - a tiny registry where each game publishes its own difficulty profiles
 *   - a session object that carries the chosen difficulty into game init
 *
 * Loaded as a classic script so it also works from file:// (no bundler, no modules).
 */
(function (global) {
  'use strict';

  var LEVELS = ['easy', 'normal', 'hard'];
  var DEFAULT_LEVEL = 'normal';

  var registry = {};

  function isValid(value) {
    return typeof value === 'string' && LEVELS.indexOf(value.trim().toLowerCase()) !== -1;
  }

  // Always returns a playable level. Used when a game must start right now.
  function normalize(value) {
    return isValid(value) ? value.trim().toLowerCase() : DEFAULT_LEVEL;
  }

  // Returns the level only when the caller really supplied a valid one,
  // otherwise null so the UI can ask the user to choose.
  function resolve(value) {
    return isValid(value) ? value.trim().toLowerCase() : null;
  }

  function registerGame(gameId, definition) {
    if (!gameId || !definition) return null;
    registry[gameId] = definition;
    return definition;
  }

  function getGame(gameId) {
    return Object.prototype.hasOwnProperty.call(registry, gameId) ? registry[gameId] : null;
  }

  /*
   * Merges a game's difficulty profile with its user facing copy so a game
   * only has to read one object at start-up.
   * Returns null when the game is not registered (programming error).
   */
  function getConfig(gameId, difficulty) {
    var game = getGame(gameId);
    if (!game) {
      if (global.console && console.warn) {
        console.warn('[difficulty] unknown game: ' + gameId);
      }
      return null;
    }

    var level = normalize(difficulty);
    var profile = game.difficulties && game.difficulties[level];
    if (!profile) {
      if (global.console && console.warn) {
        console.warn('[difficulty] no profile for ' + gameId + ':' + level + ', using ' + DEFAULT_LEVEL);
      }
      level = DEFAULT_LEVEL;
      profile = game.difficulties && game.difficulties[level];
    }

    var copy = (game.copy && game.copy.options && game.copy.options[level]) || {};
    var merged = {};
    var key;

    for (key in profile) {
      if (Object.prototype.hasOwnProperty.call(profile, key)) merged[key] = profile[key];
    }

    merged.gameId = gameId;
    merged.difficulty = level;
    merged.label = copy.label || level;
    merged.description = copy.description || '';
    merged.title = game.title || '';
    merged.startLabel = game.startLabel || 'Start Game';
    merged.backLabel = game.backLabel || 'Back';

    return merged;
  }

  /*
   * The difficulty belongs to the running game session, not to storage:
   * restart keeps the chosen difficulty, only a new choice changes it.
   */
  function createSession(gameId, difficulty) {
    return {
      gameId: gameId,
      difficulty: normalize(difficulty),
      score: 0,
      setScore: function (value) {
        this.score = value;
        return this.score;
      },
      // Keeps the chosen difficulty, clears the run.
      restart: function () {
        this.score = 0;
        return this;
      }
    };
  }

  // Optional convenience: pre-select a level from ?difficulty=hard
  function fromQueryString(search) {
    try {
      var params = new URLSearchParams(search || '');
      return resolve(params.get('difficulty'));
    } catch (error) {
      return null;
    }
  }

  global.GameDifficulty = {
    LEVELS: LEVELS,
    DEFAULT_LEVEL: DEFAULT_LEVEL,
    isValid: isValid,
    normalize: normalize,
    resolve: resolve,
    registerGame: registerGame,
    getGame: getGame,
    getConfig: getConfig,
    createSession: createSession,
    fromQueryString: fromQueryString
  };
})(typeof window !== 'undefined' ? window : this);
