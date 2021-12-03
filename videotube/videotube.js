(() => {
	const throttle = (type, name, obj) => {
		obj = obj || window;
		let running = false;
		const func = function() {
			if (running) {
				return;
			}
			running = true;
			requestAnimationFrame(function() {
				obj.dispatchEvent(new CustomEvent(name));
				running = false;
			});
		};
		obj.addEventListener(type, func);
	};

	throttle("resize", "optimizedResize");
})();

((obj) => {
	obj = obj || window;
	obj.animation = function(elem, prop, cb) {
		const count = prop.count;
		let counter = 0
		if (prop.start) {
			prop.start.forEach(item => {
				elem.style[item[0]] = item[1]
			})
		}

		const allAnimation = [];

		prop.anim.forEach(([style, from, to]) => {
			const max = Math.max(from, to);
			const min = Math.min(from, to);
			const step = (max - min) / count;
			allAnimation.push({style, from, to, step, reverse: min === to})
		});


		const rafAnimation = () => {

			allAnimation.forEach((item) => {
				if (item.reverse) {
					item.from -= item.step
				} else {
					item.from += item.step
				}

				elem.style[item.style] = item.from;
			})

			counter++;
			if (counter < count) {

				requestAnimationFrame(rafAnimation);
			} else {
				if (prop.end) {
					prop.end.forEach(item => {
						elem.style[item[0]] = item[1]
					})
				}
				if (cb) cb();
			}


		}
		requestAnimationFrame(rafAnimation);
	};
})();


const init = () => {

	const overlay = document.createElement('div');
	overlay.className = 'videotube-modal-overlay'
	document.body.insertAdjacentElement('beforeend', overlay);

	const video = document.createElement('div');
	video.id = 'videotube-modal-container'

	const sizeBlockList = [
		[3840, 2160],
		[2560, 1440],
		[1920, 1080],
		[1280, 720],
		[854, 420],
		[640, 360],
		[426, 240]
	];


	const sizeVideo = () => {
		const sizeBlock = sizeBlockList.find(item => item[0] < window.visualViewport.width) ||
			sizeBlockList[sizeBlockList.length - 1];

		const iframe = document.getElementById('videotube-modal');
		iframe.width = sizeBlock[0];
		iframe.height = sizeBlock[1];
		video.style.cssText = `
			width: ${sizeBlock[0]};
			height: ${sizeBlock[1]};
		`;

	}

	const sizeContainer = () => {

		const wh = window.visualViewport.height;
		const ww = window.visualViewport.width;
		const fw = video.style.width;
		const fh = video.style.height;

		video.style.left = (ww - fw) / 2;
		video.style.top = (wh - fh) / 2;
		overlay.style.height = document.documentElement.clientHeight;
	}

	const sizeVideoTubeModal = () => {
		sizeContainer();
		sizeVideo();
	}

	const closeVideoTubeModal = () => {

		animation(overlay, {
				end: [['display', 'none']],
				anim: [['opacity', 1, 0]],
				count: 20,
			},
			() => {
				overlay.textContent = "";
			}
		);
		window.removeEventListener("optimizedResize", sizeVideoTubeModal);
		document.removeEventListener('keyup', closeContainerEsc);
	}

	const closeContainerEsc = e => {
		if (e.keyCode === 27) {
			closeVideoTubeModal();
		}
	}


	const openVideoTubeModal = e => {
			const target = e.target.closest('.tube');
			if (!target) return;

			const href = target.href;
			const search = href.includes('youtube');
			let idVideo = search ? href.match(/(\?|&)v=([^&]+)/)[2] : href.match(/(\.be\/)([^&]+)/)[2];

			if (idVideo.length === 0) return;

			e.preventDefault();

			animation(overlay, {
					start: [['display', 'block']],
					anim: [['opacity', 0, 1]],
					count: 20,
				}
			);

			overlay.insertAdjacentHTML('beforeend', `
			<div id="videotube-modal-loading">Загрузка...</div>
			<div id="videotube-modal-close">&#10006;</div>
			<div id="videotube-modal-container">
				<iframe src="https://youtube.com/embed/${idVideo}?autoplay=1" 
					frameborder="0"
					id="videotube-modal" 
					allowfullscreen
					allow="autoplay">
				</iframe>
			</div>
		`)

			sizeVideo();
			sizeContainer();

			window.addEventListener("optimizedResize", sizeVideoTubeModal);
			document.addEventListener('keyup', closeContainerEsc);
		}
	;


	overlay.addEventListener("click", closeVideoTubeModal);
	document.addEventListener('click', openVideoTubeModal)

}

document.addEventListener('DOMContentLoaded', init)
