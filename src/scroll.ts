/**
 * @desc 通过传入的容器选择器或者容器元素，返回容器
 *
 */
function getEle(el: boxEle): boxEle {
	let _el: boxEle;
	if (typeof el === 'string') {
		_el = document.querySelector(el)! as HTMLElement;
	} else {
		_el = el;
	}
	return _el;
}

function createEl(tag: string): HTMLElement {
	return document.createElement(tag);
}

const barStyle = {
	position: 'absolute',
	right: 0,
	top: 0,
	zIndex: 10,
	width: '10px',
	height: '30%',
	cursor: 'pointer',
	background: 'rgba(102, 204, 255, .6)',
	'border-radius': '10px',
	transfrom: 'translateY(0px)',
};

const listboxStyle = {
	height: '100%',
	overflow: 'auto',
};

const listStyle: style = {
	margin: 0,
	padding: 0,
	position: 'relative',
};

const itemStyle: style = {
	'list-style': 'none',
	padding: '0 5px',
	height: '30px',
	position: 'absolute',
	left: 0,
	overflow: 'hidden',
	'text-overflow': 'ellipsis',
	'white-space': 'no-wrap',
};

let data: dataVal[];
export default function generateScroll(ele: boxEle, options: optionsData): void {
	const el = getEle(ele) as HTMLElement;
	data = options.data;
	const h = options.h || 30;
	if (!data || !data.length) {
		console.warn('请输入数据');
		return;
	}
	// 包含总长度的div元素
	const listbox = generateEle('div', 'scroll-list-container-box', listboxStyle);

	// 所有内容高度的滚动区域
	listStyle.height = h * data.length + 'px';
	const list = generateEle('ul', 'scroll-list-box', listStyle);

	// 滚动条
	const bar = generateEle('div', 'scroll-bar', barStyle);
	// 给滚动条绑定点击拖拽事件
	bindDragScroll(listbox, bar, h, h * data.length);

	listbox.appendChild(list);
	el.appendChild(listbox);
	el.appendChild(bar);

	const frag = generateItems(0, h);
	list.appendChild(frag);

	const boxH = parseInt(getStyle(listbox, 'height') as any);
	dealScroll(listbox, bar, h, h * data.length);
}

/**
 * @desc 根据标签名生成对应的元素，并添加对应的样式
 * @param {string} tag 生成的标签名
 * @param {string} name 生成的标签的class名字
 * @param {}
 */
function generateEle(tag: string = 'div', name: string, style: style): HTMLElement {
	const el = createEl(tag);
	el.className = name;
	Object.assign(el.style, style);
	return el;
}

function dealScroll(el: HTMLElement, bar: HTMLElement, h: number, sumH: number): void {
	const box_h = parseInt(getStyle(el, 'height') as any);
	const bar_h = parseInt(getStyle(bar, 'height') as any);
	sumH = sumH - box_h;
	el.addEventListener('scroll', function (e: Event) {
		const scroll_v = el.scrollTop;
		const per = scroll_v / sumH;
		const translate_y = (box_h - bar_h) * per;
		bar.style.transform = `translateY(${translate_y}px)`;
		const base_num = Math.floor(scroll_v / h);
		const frag = generateItems(base_num, h);
		const list_el = el.firstChild as HTMLElement;
		// console.log(list_el)
		list_el.innerHTML = '';
		list_el.appendChild(frag);
		// console.log(frag)
	});
}

function generateItems(base: number, h: number): DocumentFragment {
	base -= 2;
	if (base <= 0) {
		base = 0;
	}
	const frag = document.createDocumentFragment();
	data.slice(base, base + 20).forEach((item, i) => {
		const el = createEl('li');
		el.innerText = item + '';
		i = (item as number) - 1;
		el.style.top = i * h + 'px';
		Object.assign(el.style, itemStyle);
		frag.appendChild(el);
	});
	return frag;
}

/**
 * @desc 滚动条拖拽事件
 * @param {HTMLElement} el 包裹滚动列表的元素
 * @param {HTMLElement} bar 滚动条
 * @param {Number} h 每一个元素的高度
 * @param {Number} sumH 列表总高度
 */
function bindDragScroll(el: HTMLElement, bar: HTMLElement, h: number, sumH: number): void {
	let isCanMove = false;
	let initY: number;
	let translate_y: number = 0;
	bar.addEventListener('mousedown', e => {
		isCanMove = true;
		initY = e.clientY;
		const t_y = bar.style.transform;
		const t_y_Rxp = /translateY\((\d+\.?(\d+)?)px\)/;
		if (t_y.match(t_y_Rxp)) {
			translate_y = Number(RegExp.$1);
		}
	});
	document.addEventListener('mousemove', e => {
		if (isCanMove) {
			const diffY = e.clientY - initY;

			const v = translate_y + diffY;
			const top = el.scrollTop;
			el.scrollTop = top + diffY;
			bar.style.transform = `translateY(${v}px)`;
		}
	});
	document.addEventListener('mouseup', e => {
		isCanMove = false;
	});
}

/**
 * @desc 获取指定元素的样式
 */
function getStyle(el: HTMLElement, tag?: string): CSSStyleDeclaration | string | number {
	if (!el) {
		return '';
	}
	const style = window.getComputedStyle(el, null);
	if (tag) {
		return style[tag as any];
	}
	return style;
}