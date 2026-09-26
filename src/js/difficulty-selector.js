/*
 * Reusable difficulty selection screen.
 *
 * One component, used by every game before gameplay starts. It never touches
 * game state itself: the host page passes a gameId, the component reads that
 * game's registered copy, and hands the chosen level back through onConfirm.
 *
 *   DifficultySelector.mount(container, {
 *     gameId: 'memory-sequence',
 *     initial: 'easy' | null,
 *     onConfirm: function (difficulty) {},
 *     onBack: function () {}
 *   })
 *
 * Accessibility: real radio inputs (arrow keys work natively), fieldset/legend
 * grouping, visible focus ring, a "Selected" badge so the state is not carried
 * by colour alone, and a Start button that stays disabled until a choice is made.
 */
(function (global) {
  'use strict';

  var FALLBACK_COPY = {
    title: 'Choose Your Difficulty',
    subtitle: 'Select how challenging you want today\'s activity to be.',
    options: {
      easy: { label: 'Easy', description: 'Relaxed pace' },
      normal: { label: 'Normal', description: 'Balanced challenge' },
      hard: { label: 'Hard', description: 'More challenging' }
    }
  };

  var ACCENT = {
    easy: {
      card: 'peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-focus-visible:ring-emerald-200',
      flag: 'text-emerald-700'
    },
    normal: {
      card: 'peer-checked:border-sky-500 peer-checked:bg-sky-50 peer-focus-visible:ring-sky-200',
      flag: 'text-sky-700'
    },
    hard: {
      card: 'peer-checked:border-rose-500 peer-checked:bg-rose-50 peer-focus-visible:ring-rose-200',
      flag: 'text-rose-700'
    }
  };

  var CARD_BASE =
    'flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 ' +
    'border-slate-200 bg-white px-4 py-6 text-center shadow-sm transition-colors sm:min-h-48 ' +
    'peer-focus-visible:ring-4 peer-checked:shadow-md';

  var FLAG_BASE =
    'flex h-5 items-center justify-center gap-1 text-sm font-bold uppercase ' +
    'tracking-wide invisible peer-checked:visible';

  var START_BASE =
    'min-h-14 w-full cursor-pointer rounded-2xl px-8 text-lg font-semibold shadow-sm ' +
    'transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ' +
    'disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 sm:w-auto';

  // Added once a level is chosen; the disabled: variants cover the waiting state.
  var START_READY = ['bg-sky-600', 'text-white', 'hover:bg-sky-700'];

  var BACK_BASE =
    'min-h-14 w-full cursor-pointer rounded-2xl border-2 border-slate-300 bg-white px-8 text-lg ' +
    'font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none ' +
    'focus-visible:ring-4 focus-visible:ring-slate-300 sm:w-auto';

  var instanceCount = 0;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function copyFor(game) {
    var source = (game && game.copy) || {};
    var options = source.options || {};
    return {
      title: source.title || FALLBACK_COPY.title,
      subtitle: source.subtitle || FALLBACK_COPY.subtitle,
      options: {
        easy: options.easy || FALLBACK_COPY.options.easy,
        normal: options.normal || FALLBACK_COPY.options.normal,
        hard: options.hard || FALLBACK_COPY.options.hard
      }
    };
  }

  function mount(container, options) {
    if (!container) return null;

    var settings = options || {};
    var levels = (global.GameDifficulty && global.GameDifficulty.LEVELS) || ['easy', 'normal', 'hard'];
    var registry = global.GameDifficulty;
    var game = registry ? registry.getGame(settings.gameId) : null;
    var copy = copyFor(game);
    var startLabel = (game && game.startLabel) || 'Start Game';
    var backLabel = (game && game.backLabel) || 'Back';
    var uid = 'difficulty-' + ++instanceCount;
    var selected = null;
    var radios = [];

    container.textContent = '';

    var section = el('section', 'w-full');
    var title = el('h2', 'text-center text-2xl font-bold text-slate-700 sm:text-3xl', copy.title);
    title.id = uid + '-title';
    var subtitle = el('p', 'mx-auto mt-3 max-w-md text-center text-base text-slate-500', copy.subtitle);
    subtitle.id = uid + '-subtitle';

    section.setAttribute('aria-labelledby', title.id);
    section.appendChild(title);
    section.appendChild(subtitle);

    var fieldset = el('fieldset', 'mt-6');
    fieldset.appendChild(el('legend', 'sr-only', 'Difficulty level'));

    var grid = el('div', 'grid grid-cols-1 gap-4 sm:grid-cols-3');
    var groupName = uid + '-group';

    levels.forEach(function (level) {
      var text = copy.options[level] || { label: level, description: '' };
      var accent = ACCENT[level] || ACCENT.normal;

      var label = el('label', 'block w-full cursor-pointer');
      var radio = el('input', 'sr-only peer');
      radio.type = 'radio';
      radio.name = groupName;
      radio.value = level;
      radio.setAttribute('aria-describedby', subtitle.id);

      var flag = el('span', FLAG_BASE + ' ' + accent.flag, 'Selected');
      var mark = el('span', 'text-base leading-none', '✓');
      flag.setAttribute('aria-hidden', 'true');
      flag.insertBefore(mark, flag.firstChild);

      var card = el('span', CARD_BASE + ' ' + accent.card);
      card.appendChild(el('span', 'text-xl font-bold text-slate-800 sm:text-2xl', text.label));
      card.appendChild(el('span', 'text-sm text-slate-600 sm:text-base', text.description));

      label.appendChild(radio);
      label.appendChild(flag);
      label.appendChild(card);

      radio.addEventListener('change', function () {
        if (!radio.checked) return;
        selected = level;
        setReady(true);
        if (typeof settings.onSelect === 'function') settings.onSelect(selected);
      });

      grid.appendChild(label);
      radios.push(radio);
    });

    fieldset.appendChild(grid);

    var actions = el('div', 'mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center');

    var startBtn = el('button', START_BASE, startLabel);
    startBtn.type = 'button';
    startBtn.disabled = true;

    var backBtn = el('button', BACK_BASE, backLabel);
    backBtn.type = 'button';

    actions.appendChild(startBtn);
    actions.appendChild(backBtn);
    fieldset.appendChild(actions);
    section.appendChild(fieldset);

    container.appendChild(section);

    function confirm() {
      if (!selected) return;
      if (typeof settings.onConfirm === 'function') settings.onConfirm(selected);
    }

    function setReady(ready) {
      startBtn.disabled = !ready;
      for (var i = 0; i < START_READY.length; i++) {
        startBtn.classList.toggle(START_READY[i], ready);
      }
    }

    startBtn.addEventListener('click', confirm);

    backBtn.addEventListener('click', function () {
      if (typeof settings.onBack === 'function') settings.onBack();
    });

    // Enter on a chosen option starts the game (Enter on the button is native).
    section.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') return;
      if (!event.target || event.target.type !== 'radio') return;
      event.preventDefault();
      confirm();
    });

    function setDifficulty(level) {
      var value = registry ? registry.resolve(level) : (levels.indexOf(level) !== -1 ? level : null);
      for (var i = 0; i < radios.length; i++) {
        radios[i].checked = radios[i].value === value;
      }
      selected = value;
      setReady(value !== null);
      return selected;
    }

    return {
      getDifficulty: function () {
        return selected;
      },
      open: function (level) {
        container.classList.remove('hidden');
        setDifficulty(typeof level === 'undefined' ? null : level);
        var focusTarget = null;
        for (var i = 0; i < radios.length; i++) {
          if (radios[i].checked) focusTarget = radios[i];
        }
        (focusTarget || radios[0]).focus();
      },
      close: function () {
        container.classList.add('hidden');
      }
    };
  }

  global.DifficultySelector = {
    mount: mount
  };
})(typeof window !== 'undefined' ? window : this);
