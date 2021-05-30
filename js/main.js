"use strict";

(() => {

  document.addEventListener('DOMContentLoaded', () => {

    const $popupBtns = document.querySelectorAll('.popup-btn');
    const $popupCloseBtns = document.querySelectorAll('.popup__close-btn');
    const $popupOverlay = document.querySelector('.popup-overlay');
    const $popups = document.querySelectorAll('.popup');
    const $popupsInputs = document.querySelectorAll('.popup__form-input');
    const $addContactBtn = document.querySelector('.add-contact__btn');
    const $contactsBlock = document.querySelector('.popup-form__contacts');

    // Текущий год в Footer:

    document.querySelector('.footer__year').innerText = new Date().getFullYear();

    /* Create New Contact: */

    $addContactBtn.addEventListener('click', (e) => {

      e.preventDefault();
      const contact = createNewContact();
      $contactsBlock.append(contact);
      choicesSelect();

    });

    const createNewContact = () => {

      const $contactBlock = createItem('div', 'form-contacts__item contacts-item', '', '', );
      const $select = createItem('select', 'contacts-item__select', '', 'name', 'contacts');
      const $option1 = createItem('option', '', 'Телефон', 'value', 'phone');
      const $option2 = createItem('option', '', 'Доп. телефон', 'value', 'add-phone');
      const $option3 = createItem('option', '', 'Email', 'value', 'email');
      const $option4 = createItem('option', '', 'ВКонтакте', 'value', 'vk');
      const $option5 = createItem('option', '', 'Facebook', 'value', 'facebook');
      const $option6 = createItem('option', '', 'Другое', 'value', 'other');
      const $input = createItem('input', 'contacts-item__input', '', 'type', 'text');
      const $delBtn = createItem('button', 'contacts-item__delete-btn', '', '', '');

      $select.setAttribute('aria-label', 'Выбор способа связи');
      $input.setAttribute('placeholder', 'Введите данные контакта');

      $select.append($option1, $option2, $option3, $option4, $option5, $option6);
      $contactBlock.append($select, $input, $delBtn);

      $delBtn.innerHTML = `<svg class="delete__icon"><use xlink:href="./img/svg/sprite.svg#delete"></use></svg>`;

      $delBtn.addEventListener('click', (e) => {
        e.preventDefault();
        $contactBlock.remove();
      });

      return $contactBlock;

    };

    /* Create Item: */

    const createItem = (element = 'div', className = '', value = '', attrName, attrValue) => {
      const item = document.createElement(element);
      item.setAttribute('class', className);
      item.textContent = value;
      if (attrName && attrValue) {
        item.setAttribute(attrName, attrValue);
      };
      return item;
    };

    /* Popups: */

    const openPopup = (el) => {
      el.addEventListener('click', (e) => {
        let path = e.currentTarget.getAttribute('data-path');
        $popups.forEach((el) => {
          el.classList.remove('popup--visible');
        });
        document.querySelector(`[data-target="${path}"]`).classList.add('popup--visible');
        $popupOverlay.classList.add('popup-overlay--visible');
      });
    };

    const closePopup = () => {
      $popupOverlay.classList.remove('popup-overlay--visible');
      $popups.forEach((el) => {
        el.classList.remove('popup--visible');
      });
    };

    $popupBtns.forEach((el) => {
      openPopup(el);
    });

    $popupCloseBtns.forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        closePopup();
      });
    });

    $popupOverlay.addEventListener('click', (e) => {
      if (e.target == $popupOverlay) {
        closePopup();
      };
    });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && $popupOverlay.classList.contains('popup-overlay--visible')) {
        closePopup();
      };
    });

    const checkPopups = (el) => {
      if (el.value.length > 0) {
        el.classList.add('popup__form-input--filled');
      } else {
        el.classList.remove('popup__form-input--filled');
      };
    };

    $popupsInputs.forEach((el) => {
      el.addEventListener('input', () => {
        checkPopups(el);
      });
    });

    /* Choices Select: */

    const choicesSelect = () => {
      const elements = document.querySelectorAll('.contacts-item__select');
      elements.forEach(el => {
        const choices = new Choices(el, {
          searchEnabled: false,
          shouldSort: false,
        });
        let ariaLabel = el.getAttribute('aria-label');
        el.closest('.choices').setAttribute('aria-label', ariaLabel);
      });
    };

    choicesSelect();

  });

})();