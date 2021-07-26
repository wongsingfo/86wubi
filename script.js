function WubiInput() {
	const whitespaceCharacters = [' ', ' ',
	  '\b', '\t', '\n', '\v', '\f', '\r', `\"`, `\'`, `\\`,
	  '\u0008', '\u0009', '\u000A', '\u000B', '\u000C',
	'\u000D', '\u0020','\u0022', '\u0027', '\u005C',
	'\u00A0', '\u2028', '\u2029', '\uFEFF'];

	function isSpace(str) {
		for (const space of whitespaceCharacters) {
			if (str.indexOf(space) > -1) {
				return true;
			}
		}
		return false;
	}

	function moveInputBox() {
		const cursor = document.getElementById('cursor');
		const { left, top } = cursor.getBoundingClientRect();
		const { offsetLeft, offsetTop, offsetHeight } = cursor;
		const inputbox = document.getElementById('inputbox');
		inputbox.style.top = offsetTop + offsetHeight;
		inputbox.style.left = offsetLeft;
		const inputtext = document.getElementById('inputtext');
		inputtext.focus();
	}

	return {
		target: "冰灯是流行于中国北方的一种古老的民间艺术形式。",
		progress: Number(localStorage.getItem("progress")) || 0,
		inputtext: '',

		getText() {
			fetch('text02.txt')
				.then(response => response.text())
				.then(text => {
					this.target = text;
					setTimeout(() => moveInputBox(), 0);
				});
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
		},
	};
}

