const GENERAL = new Map();
const MAX_WIDTH = 768;
const body = document.body;
let imageList = [];
let thumbsList = [];
let activeWrapper = null;
let throttling = null;

const closePopup = () => {
    activeWrapper.removeEventListener('scroll', throttling);
    activeWrapper.remove();
    activeWrapper = null;
    imageList = [];
    thumbsList = [];
    body.classList.remove('no-scrolling');
};

const updateActiveThumbs = (index) => {
    thumbsList.forEach(item => {
        item.style.border = `0px solid #8b8b8b`;
    });
    thumbsList[index].style.border = `1px solid #8b8b8b`;
};

const showImages = () => {
    let index = 0; 
    let currentWidth = window.innerWidth;
    
    imageList.forEach(item => {
        if (currentWidth > MAX_WIDTH) {
            const top = item.getBoundingClientRect().top;
            const height = item.getBoundingClientRect().height;
            
            if (top < 10 && Math.abs(top) < height) {
                index = item.dataset.popupId;       
            }
        } else {
            const left = item.getBoundingClientRect().left;
            const width = item.getBoundingClientRect().width;
            
            if (left < 10 && Math.abs(left) < width) {
                index = item.dataset.popupId;       
            }
        }
    });

    updateActiveThumbs(index);
};

const changeScrollSlide = (index=0) => {
    imageList[index].scrollIntoView({behavior: "smooth"});
};

const openPopup = (name, item, id) => {
    const wrapper = document.createElement('div');
    const thumbs = document.createElement('div');
    const closeBtn = document.createElement('button');
    const clone = item.querySelector('img').cloneNode(true);
    const cloneLeft = item.getBoundingClientRect().left;
    const cloneTop = item.getBoundingClientRect().top;
    const cloneWidth = item.getBoundingClientRect().width;
    const cloneHeight = item.getBoundingClientRect().height;
    const currentWidth = window.innerWidth;

    clone.style.cssText = `
        position: fixed;
        z-index: 9999;
        left: ${cloneLeft}px;
        top: ${cloneTop}px;
        height: ${cloneHeight}px;
        min-height: ${currentWidth < MAX_WIDTH ? 0 : cloneHeight}px;
        min-width: ${currentWidth < MAX_WIDTH ? 0 : cloneWidth}px;
        width: ${cloneWidth}px;
        -o-transition: 0.6s ease-in-out;
        -webkit-transition: 0.6s ease-in-out;
        transition: 0.6s ease-in-out;
    `;
    wrapper.style.cssText = `
        position: fixed;
        z-index: 9998;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        ${currentWidth < MAX_WIDTH ?
        `
            overflow-x: auto;
            -ms-scroll-snap-type: x mandatory; 
            scroll-snap-type: x mandatory;
            -webkit-box-orient: horizontal;
            -webkit-box-direction: normal;
            -ms-flex-direction: row;
            flex-direction: row;
        ` :
        `
            overflow-y: auto;
            scroll-snap-type: none;
            -webkit-box-orient: vertical;
            -webkit-box-direction: normal;
            -ms-flex-direction: column;
            flex-direction: column;
        `}
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        scroll-behavior: smooth;
        opacity: 0;
    `;
    thumbs.style.cssText = `
        cursor: pointer;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        gap: 10px;
        position: fixed;
        ${currentWidth < MAX_WIDTH ? 
        `   
            padding: 0 20px;
            width: 100%;
            top: 97%;
            -webkit-box-orient: horizontal;
            -webkit-box-direction: normal;
            -ms-flex-direction: row;
            flex-direction: row;
        ` : 
        `
            padding-right: 20px;
            width: 80px;
            overflow-y: auto;
            height: 80%;
            top: 50%;
            left: 60px;
            -webkit-transform: translateY(-50%);
            -ms-transform: translateY(-50%);
            transform: translateY(-50%);
            -webkit-box-orient: vertical;
            -webkit-box-direction: normal;
            -ms-flex-direction: column;
            flex-direction: column;
        `}
        z-index: 9999;
        scroll-behavior: smooth;
        opacity: 0;
        -o-transition: 0.6s ease;
        -webkit-transition: 0.6s ease;
        transition: 0.6s ease;
    `;

    closeBtn.style.cssText = `
        cursor: pointer;
        width: 18px;
        height: 18px;
        background-image:url("data:image/png;base64,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");
        position: fixed;
        right: 20px;
        top: 20px;
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
        border: none;
        padding: 0;
        background-color: transparent;
    `;
    
    setTimeout(() => {
        clone.style.left = 0;
        clone.style.top = 0;
        if (currentWidth < MAX_WIDTH) {
            clone.style.height = '100%';
        } else {
            clone.style.height = 'auto';
        }

        clone.style.width = `100%`;
    }, 20);
    setTimeout(() => {
        clone.remove();
        wrapper.style.opacity = 1;
        thumbs.style.opacity = 1;
    }, 800);

    GENERAL.get(name).forEach((item, i) => {
        const img = document.createElement('img');
        const imgThumb = document.createElement('img');
        const elementThumb = document.createElement('div');

        img.style.cssText = `
            width: 100%;
            height: ${currentWidth < MAX_WIDTH ? '100%' : 'auto'};
            display: block;
            flex-shrink: 0;
            ${currentWidth < MAX_WIDTH ? 'scroll-snap-align: start' : ''};
        `;

        if (currentWidth < MAX_WIDTH) {
            imgThumb.style.cssText = `
                display: none;
            `;
            elementThumb.style.cssText = `
                flex: 1 1 auto;
                height: 2px;
                background-color: #000;
                border-radius: 3px;
            `;
        } else {
            imgThumb.style.cssText = `
                width: 100%;
                height: 100%;
                display: block;
                object-fit: cover,
            `;
            elementThumb.style.cssText = `
                width: 100%;
                height: 80px;
                flex: 0 0 80px;
                display: block;
            `;
        }

        if (i === 0) {
            elementThumb.style.border = `1px solid #8b8b8b`;
        }

        img.dataset.popupId = i;
        img.src = item.href;
        imgThumb.src = item.href;
        elementThumb.append(imgThumb);
        thumbs.append(elementThumb);
        wrapper.append(img);
        imageList.push(img);
        thumbsList.push(elementThumb);

        elementThumb.addEventListener('click', () => {
            changeScrollSlide(i)
        });
    });

    body.append(clone);
    wrapper.append(thumbs);
    wrapper.append(closeBtn);
    body.append(wrapper);
    body.classList.add('no-scrolling');
    activeWrapper = wrapper;
    changeScrollSlide(id);

    throttling = throttle(showImages, 7);
    wrapper.addEventListener('scroll', throttling);
    closeBtn.addEventListener('click', closePopup)
};

export const customPopup = () => {
    const list = document.querySelectorAll('[data-custom-popup]');

    if (!list[0]) return;

    list.forEach((item, i) => {
        const name = item.dataset.customPopup;
        
        if (name.length > 0) {
            GENERAL.has(name) ? GENERAL.set(name, [...GENERAL.get(name), item]) : GENERAL.set(name, [item]);
        } else {
            GENERAL.has('other') ? GENERAL.set('other', [...GENERAL.get(name), item]) : GENERAL.set('other', [item]);
        }

        item.addEventListener('click', (evt) => {
            evt.preventDefault();
            openPopup(name, item, i);
        });
    });

    window.addEventListener('keydown', (evt) => {
        const key = evt.key;

        if (key === 'Escape' && activeWrapper) {
            closePopup();
        }
    });
};