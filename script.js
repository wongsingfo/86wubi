function WubiInput() {
	const whitespaceCharacters = [' ', ' ',
		'\b', '\t', '\n', '\v', '\f', '\r', `\"`, `\'`, `\\`,
		'\u0008', '\u0009', '\u000A', '\u000B', '\u000C',
		'\u000D', '\u0020', '\u0022', '\u0027', '\u005C',
		'\u00A0', '\u2028', '\u2029', '\uFEFF'];

	const stopWords = '\'"()[]{}<>.,:;!?*&^%$#@~`-_=+/\\|' +
		'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' +
		'0123456789' +
		'，。“”《》——！？：、‘’';

	function isSpace(str) {
		for (const space of whitespaceCharacters) {
			if (str.indexOf(space) > -1) {
				return true;
			}
		}
		return false;
	}

	function isStopWord(str) {
		return stopWords.indexOf(str) > -1;
	}

	function moveInputBox() {
		const cursor = document.getElementById('cursor');
		const {left, top} = cursor.getBoundingClientRect();
		const {offsetLeft, offsetTop, offsetHeight} = cursor;
		const inputbox = document.getElementById('inputbox');
		const styleTop = offsetTop + offsetHeight;
		const styleLeft = offsetLeft;
		const styleHash = styleLeft * 10007 + styleTop;
		inputbox.style.top = styleTop;
		inputbox.style.left = styleLeft;
		const inputtext = document.getElementById('inputtext');
		inputtext.focus();
		return styleHash;
	}

	const waitRenderingResultMs = 50;
	const cancelWaitAfterSameRenderingResult = 10;

	const triggerMoveInputBox = (() => {
		intervalId = undefined;
		return () => {
			if (intervalId) {
				return;
			}
			let lastStyleHash = moveInputBox();
			let sameCount = 0;
			intervalId = setInterval(
				() => {
					currentStyleHash = moveInputBox();
					if (lastStyleHash === currentStyleHash) {
						sameCount += 1;
					} else {
						sameCount = 0;
					}
					lastStyleHash = currentStyleHash;
					if (sameCount > cancelWaitAfterSameRenderingResult) {
						clearInterval(intervalId);
						intervalId = undefined;
					}
				},
				waitRenderingResultMs
			);
		}
	})();


	addEventListener("resize", (event) => {
		triggerMoveInputBox()
	});

	return {
		target: "Loading...",
		progress: Number(localStorage.getItem("progress")) || 0,
		inputtext: '',

		showTextarea: false,
		isStopWord,

		getText() {
			let target = localStorage.getItem("target");
			if (target) {
				this.target = target;
				setTimeout(() => moveInputBox(), 0);
				return;
			} else {
				fetch('text.txt')
					.then(response => response.text())
					.then(text => {
						this.target = text;
						setTimeout(() => moveInputBox(), 0);
					});
			}
		},

		getTargetDone() {
			let {target, progress} = this;
			return target.substring(0, progress);
		},

		getTargetTodo() {
			let {target, progress} = this;
			return target.substring(progress);
		},

		getCharacter() {
			return this.target[this.progress];
		},

		onTextChanged() {
			let {target, progress, inputtext} = this;

			if (progress >= target.length) {
				return;
			}

			let hasEnter = false;
			let hasSpace = false;
			let newInputtext = '';
			for (let i = 0; i < inputtext.length; i++) {
				const ch = inputtext[i];
				if (target[progress] === ch) {
					progress += 1;
				} else {
					newInputtext += ch;
				}
				if ('\n' === ch) {
					hasEnter = true;
				}
				if (isSpace(ch)) {
					hasSpace = true;
				}
			}

			while (progress < target.length && isSpace(target[progress])) {
				progress += 1;
			}

			if (hasEnter) {
				newInputtext = '';
			}
			this.progress = progress;
			this.inputtext = newInputtext;
			moveInputBox();

			localStorage.setItem("progress", progress);
			localStorage.setItem("target", target);
		},

		resetProgress() {
			this.progress = 0;
			setTimeout(() => this.onTextChanged(), 10);
		},

		toggleTextarea() {
			this.showTextarea = !this.showTextarea;
			triggerMoveInputBox();
		}
	};
}

