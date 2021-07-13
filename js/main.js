"use strict";

(() => {

  document.addEventListener('DOMContentLoaded', () => {

    const $body = document.querySelector('.body');
    const $fixBlocks = document.querySelectorAll('.fix-block');
    const $tableFilter = document.querySelector('.search__input');
    const $clientsTable = document.querySelector('.clients__table');
    const $tableSort = document.querySelectorAll('.table__head-cell--sortable');
    const $tableBody = document.querySelector('.table__body');
    const $tableRows = $tableBody.getElementsByTagName('tr');
    const $tableFooter = document.querySelector('.table__footer');
    const $popupBtns = document.querySelectorAll('.popup-btn');
    const $popupOverlay = document.querySelectorAll('.popup-overlay');
    const $popups = document.querySelectorAll('.popup');
    const $popupCloseBtns = document.querySelectorAll('.popup__close-btn');
    const $popupTitle = document.querySelector('.popup__title');
    const $popupForm = document.querySelector('.popup__form');
    const $popupFormInputs = document.querySelectorAll('.popup__form-input');
    const $popupInputSurname = document.querySelector('.popup__form-input--surname');
    const $popupInputName = document.querySelector('.popup__form-input--name');
    const $popupInputMiddlename = document.querySelector('.popup__form-input--middlename');
    const $addContactBtn = document.querySelector('.add-contact-btn');
    const $contactsBlock = document.querySelector('.form-contacts');
    const $errorDescription = document.querySelectorAll('.form__error-msg');
    const $popupSubmitBtns = document.querySelectorAll('.popup__submit-btn');
    const $createClientBtn = document.querySelector('.popup__form-submit');
    const $editClientBtn = document.querySelector('.popup__form-edit');
    const $popupCancelBtns = document.querySelectorAll('.popup__cancel-btn');
    const $deleteClientBtn = document.querySelector('.popup__delete-btn');
    const $submitDeleteClientBtn = document.querySelector('.popup__del-submit');
    const $newUserBtn = document.querySelector('.new-user-btn');

    let clients = new Array();
    let currentClientID;

    // Отображение и скрытие элементов на странице:

    const hideElement = (el) => {
      el.classList.add('_hidden');
    };

    const showElement = (el) => {
      if (el.classList.contains('_hidden')) {
        el.classList.remove('_hidden');
      };
    };

    // Функция для имитации загруженности сервера:

    const delay = ms => {
      return new Promise(resolve => setTimeout(() => resolve(), ms));
    };

    // Disable & Enable Scroll (убираем 'прыжок' при открытии модального окна):

    const disableScroll = () => {
      const paddingOffset = window.innerWidth - document.body.offsetWidth + 'px';
      $body.classList.add('body--lock');
      $fixBlocks.forEach((el) => {
        el.style.paddingRight = paddingOffset;
      });
      document.body.style.paddingRight = paddingOffset;
    };

    const enableScroll = () => {
      $body.classList.remove('body--lock');
      $fixBlocks.forEach((el) => {
        el.style.paddingRight = '0px';
      });
      document.body.style.paddingRight = '0px';
    };

    // Отрисовка таблицы:

    const clearTable = () => {
      if ($tableRows.length > 0) {
        $tableBody.innerHTML = '';
      };
    };

    const renderTable = (clients) => {
      clearTable();
      clients.forEach((el) => {
        tableRow(el);
      });
      if ($tableFilter.value) {
        $tableBody.classList.add('table--filtered');
        totalClients(true);
      } else {
        $tableBody.classList.remove('table--filtered');
        totalClients(false);
      };
    };

    // Сортировка таблицы:

    $tableSort.forEach((item) => item.querySelector('span').addEventListener('click', () => {
      if (!item.classList.contains('table__head-cell--sorted', 'table__head-cell--reversed') || item.classList.contains('table__head-cell--reversed')) {
        $tableSort.forEach(el => el.classList.remove('table__head-cell--sorted', 'table__head-cell--reversed'));
        item.classList.add('table__head-cell--sorted');
        tableSort(item.dataset.sort);
      } else if (item.classList.contains('table__head-cell--sorted')) {
        item.classList.replace('table__head-cell--sorted', 'table__head-cell--reversed');
        tableSort(item.dataset.sort, true);
      };
    }));

    const clientsFilter = (field) => {
      if (field === 'id') {
        return (a, b) => a[field] - b[field];
      } else if (field === 'name') {
        return (a, b) => `${a['surname']} ${a['name']} ${a['lastName']}` > `${b['surname']} ${b['name']} ${b['lastName']}` ? 1 : -1;
      } else if (field === 'createdAt' || field === 'updatedAt') {
        return (a, b) => (new Date(a[field]) - new Date(0)) - (new Date(b[field]) - new Date(0));
      };
    };

    const tableSort = (column, reversed) => {
      let field;
      const filteredClients = tableFilter(clients);
      if (column == 0) {
        field = 'id';
      } else if (column == 1) {
        field = 'name';
      } else if (column == 2) {
        field = 'createdAt';
      } else if (column == 3) {
        field = 'updatedAt';
      };
      const sorted = filteredClients.sort(clientsFilter(field));
      if (!reversed) {
        renderTable(sorted);
      } else {
        renderTable(sorted.reverse());
      };
    };

    // Фильтрация таблицы:

    const tableFilter = (clients) => {
      const filter = $tableFilter.value;
      let filteredClients;
      if (filter) {
        filteredClients = clients.filter((client) => {
          return Object.keys(client).some((key) => {
            if (key === 'id' || key === 'name' || key === 'surname' || key === 'lastName') {
              return client[key].toString().toLowerCase().includes(filter.toLowerCase());
            } else if (key === 'createdAt' || key === 'updatedAt') {
              return new Date(client[key]).toLocaleDateString().includes(filter);
            } else if (key === 'contacts') {
              return Object.keys(client.contacts).some((key) => {
                return client.contacts[key].value.toString().toLowerCase().includes(filter.toLowerCase());
              });
            };
          });
        });
      } else {
        filteredClients = clients.slice(0);
      };
      return filteredClients;
    };

    const filterDelay = () => {
      let filterLatency;
      clearTimeout(filterLatency);
      filterLatency = setTimeout(() => {
        renderTable(tableFilter(clients));
      }, 300);
    };

    $tableFilter.addEventListener('input', filterDelay);

    // Валидация формы:

    const formValidate = (form) => {
      let error = 0;
      $popupFormInputs.forEach((el) => {
        const parent = el.parentNode;
        formRemoveError(parent);
        el.addEventListener('input', () => {
          if (parent.classList.contains('is-invalid')) {
            parent.classList.remove('is-invalid');
          } else if (parent.classList.contains('is-valid')) {
            parent.classList.remove('is-valid');
          };
        });
        el.value = spacesTest(el.value);
        el.value = el.value.charAt(0).toUpperCase() + el.value.toLowerCase().slice(1);
        if (el.classList.contains('popup__form-input--surname') || el.classList.contains('popup__form-input--name')) {
          if (!el.value || el.value.length < 2) {
            formAddError(parent);
            parent.setAttribute('data-tooltip', 'Значение не должно быть короче двух символов');
            error++;
          } else {
            if (textTest(el.value)) {
              formAddError(parent);
              parent.setAttribute('data-tooltip', 'Используйте кириллицу');
              error++;
            };
          };
        };
        if (el.classList.contains('popup__form-input--middlename')) {
          if (el.value) {
            if (el.value.length < 2) {
              formAddError(parent);
              parent.setAttribute('data-tooltip', 'Значение не должно быть короче двух символов');
              error++;
            } else {
              if (textTest(el.value)) {
                formAddError(parent);
                parent.setAttribute('data-tooltip', 'Используйте кириллицу');
                error++;
              };
            };
          };
        };
      });
      if (form.querySelectorAll('.form-contacts__item').length > 0) {
        document.querySelectorAll('.form-contacts__item').forEach((el) => {
          formRemoveError(el);
          const input = el.querySelector('.contacts-item__input');
          input.addEventListener('input', () => {
            if (el.classList.contains('is-invalid')) {
              el.classList.remove('is-invalid');
            } else if (el.classList.contains('is-valid')) {
              el.classList.remove('is-valid');
            };
          });
          input.value = spacesTest(input.value);
          if (contactValidate(input)) {
            formAddError(el);
            errorDescription(input);
            error++;
          };
        });
      };
      return error;
    };

    const contactValidate = (input) => {

      const contactType = input.getAttribute('data-value');

      if (input.value.length < 2) {
        return true;
      } else {
        if (contactType === 'phone') {
          if (input.value.length != 18 || input.value.includes('_')) {
            return true;
          };
        };
        if (contactType === 'email') {
          if (emailTest(input.value)) {
            return true;
          };
        };
        if (contactType === 'vk' || contactType === 'facebook') {
          if (!textTest(input.value)) {
            return true;
          };
        };
      };

    };

    const errorDescription = (input) => {

      const contactType = input.getAttribute('data-value');

      if (input.value.length < 2) {
        input.parentNode.setAttribute('data-tooltip', 'Значение не должно быть короче двух символов');
      } else {
        if (contactType === 'phone') {
          input.parentNode.setAttribute('data-tooltip', 'Некорректный номер телефона');
        };
        if (contactType === 'email') {
          input.parentNode.setAttribute('data-tooltip', 'Некорректный e-mail');
        };
        if (contactType === 'vk' || contactType === 'facebook') {
          input.parentNode.setAttribute('data-tooltip', 'Не допускается использование кириллицы');
        };
      };

    };

    const spacesTest = (value) => {
      return value.replace(/\s+/g, ' ').trim();
    };

    const textTest = (value) => {
      return !/[А-Яа-яЁё\s]+$/.test(value);
    };

    const emailTest = (value) => {
      return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(value);
    };

    const formAddError = (el) => {
      el.classList.remove('is-valid');
      el.classList.add('is-invalid');
    };

    const formRemoveError = (el) => {
      el.classList.remove('is-invalid');
      el.classList.add('is-valid');
      el.removeAttribute('data-tooltip');
    };

    // Create Item (создание HTML-элемента):

    const createItem = (element = 'div', className = '', value = '', attrName, attrValue) => {
      const item = document.createElement(element);
      item.setAttribute('class', className);
      item.textContent = value;
      if (attrName && attrValue) {
        item.setAttribute(attrName, attrValue);
      };
      return item;
    };

    // Create New Contact:

    $addContactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      addContact();
      checkContactsLength();
    });

    const addContact = (type, value) => {
      const contact = createNewContact(type, value);
      $contactsBlock.append(contact);
      choicesSelect();
      maskInputs();
    };

    const checkContactsLength = () => {
      const contacts = document.querySelectorAll('.contacts-item');
      if (contacts.length >= 10) {
        $addContactBtn.classList.add('add-contact-btn--hidden');
      } else if (contacts.length < 10 && $addContactBtn.classList.contains('add-contact-btn--hidden')) {
        $addContactBtn.classList.remove('add-contact-btn--hidden');
      };
    };

    const createNewContact = (type, value) => {

      const $contactBlock = createItem('div', 'form-contacts__item contacts-item', '', '', );
      const $select = createItem('select', 'contacts-item__select', '', 'name', 'contacts');
      const $optionPhone = createItem('option', '', 'Телефон', 'value', 'phone');
      const $optionEmail = createItem('option', '', 'Email', 'value', 'email');
      const $optionVk = createItem('option', '', 'ВКонтакте', 'value', 'vk');
      const $optionFacebook = createItem('option', '', 'Facebook', 'value', 'facebook');
      const $optionOther = createItem('option', '', 'Другое', 'value', 'other');
      const $input = createItem('input', 'contacts-item__input', '', 'type', 'tel');
      const $delBtn = createItem('button', 'contacts-item__delete-btn', '', '', '');

      $select.setAttribute('aria-label', 'Выбор способа связи');
      $input.setAttribute('placeholder', 'Введите данные контакта');

      $select.append($optionPhone, $optionEmail, $optionVk, $optionFacebook, $optionOther);
      $contactBlock.append($select, $input, $delBtn);

      if (type && value) {
        $select.value = type;
        $input.value = value;
        changeInputType($input, type);
      };

      $input.setAttribute('data-value', $select.value);

      $delBtn.innerHTML = `<svg class="delete-btn__icon"><use xlink:href="./img/svg/sprite.svg#delete"></use></svg>`;
      $delBtn.setAttribute('title', 'Удалить контакт');

      $delBtn.addEventListener('click', () => {
        $contactBlock.remove();
        checkContactsLength();
      });

      $select.addEventListener('change', (el) => {
        $input.setAttribute('data-value', el.target.value);
        changeInputType($input, el.target.value);
      });

      return $contactBlock;

    };

    const changeInputType = (input, value) => {
      if (value === 'phone') {
        input.setAttribute('type', 'tel');
        new Inputmask("+7 (999) 999-99-99").mask(input);
      } else if (value === 'email') {
        input.setAttribute('type', 'email');
        removeMask(input);
      } else {
        input.setAttribute('type', 'text');
        removeMask(input);
      };
    };

    // Добавляем контакты к объекту клиента:

    const addContacts = (contactsBlock) => {

      const clientContacts = new Array();

      const contacts = contactsBlock.querySelectorAll('.contacts-item');
      if (contacts.length != 0) {
        contacts.forEach((el) => {
          const input = el.querySelector('.contacts-item__input');
          let type = input.getAttribute('data-value');
          let value;
          if (input.inputmask) {
            value = '+7' + input.inputmask.unmaskedvalue();
          } else {
            value = input.value;
          };
          if (value.length > 1) {
            const contact = new Object({
              type,
              value,
            });
            clientContacts.push(contact);
          };
        });

        return clientContacts;

      };
    };

    // Создание нового клиента:

    $createClientBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      let error = formValidate($popupForm);
      if (error === 0) {
        lockingForm();
        const newClient = await createClient('', $popupInputSurname.value, $popupInputName.value, $popupInputMiddlename.value, $contactsBlock);
        if (newClient) {
          clearForm();
          clients.push(newClient);
          renderTable(tableFilter(clients));
        };
        unlockingForm();
      };
    });

    const createClient = async (id, surname, name, lastName, contactsBlock) => {

      const client = new Object();

      client.surname = surname;
      client.name = name;
      if (lastName) {
        client.lastName = lastName;
      };
      if (contactsBlock) {
        if (id) {
          client.contacts = contactsBlock;
        } else {
          client.contacts = addContacts(contactsBlock);
        };
      };

      const newClient = await addClient(client, $createClientBtn);
      return newClient;

    };

    // Редактирование клиента:

    $editClientBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      let error = formValidate($popupForm);
      if (error === 0) {
        lockingForm();
        const editedClient = await editClient(currentClientID, $popupInputSurname.value, $popupInputName.value, $popupInputMiddlename.value, $contactsBlock);
        if (editedClient) {
          closePopup();
          clients[clients.findIndex(client => client.id === editedClient.id)] = editedClient;
          renderTable(tableFilter(clients));
        };
        unlockingForm();
      };
    });

    const editClient = async (id, surname, name, lastName, contactsBlock) => {

      const client = await getClient(id);

      if (client.contacts) {
        delete client.contacts;
      };
      client.surname = surname;
      client.name = name;
      if (lastName) {
        client.lastName = lastName;
      };

      client.contacts = addContacts(contactsBlock);

      const editedClient = await patchClient(client, $editClientBtn);
      return editedClient;

    };

    // Ряд в таблице:

    const tableRow = (client) => {

      const getTime = (date) => {
        let hours = String(date.getHours());
        let minutes = String(date.getMinutes());
        if (hours.length < 2) {
          hours = '0' + hours;
        };
        if (minutes.length < 2) {
          minutes = '0' + minutes;
        };
        return `${hours}:${minutes}`;
      };

      const fullName = client.lastName ? `${client.surname} ${client.name} ${client.lastName}` : `${client.surname} ${client.name}`;
      const createdAt = new Date(client.createdAt).toLocaleDateString();
      const createTime = getTime(new Date(client.createdAt));
      const updatedAt = new Date(client.updatedAt).toLocaleDateString();
      const updateTime = getTime(new Date(client.updatedAt));

      newTableRow(client, fullName, createdAt, createTime, updatedAt, updateTime);

    };

    // Функция создания нового ряда таблицы:

    const newTableRow = (client, fullName, createdAt, createTime, updatedAt, updateTime) => {

      let $row, $id, $fullName, $createdAt, $updatedAt, $contacts, $actions, $editBtn, $delBtn;

      $row = createItem('tr', 'table__row', '', 'data-id', client.id);
      $id = createItem('td', 'table__cell table__cell--id', `${client.id}`, '', '');
      $fullName = createItem('td', 'table__cell table__cell--name', fullName, '', '');
      $createdAt = createItem('td', 'table__cell table__cell--date table__cell--create-date', '', 'aria-label', 'Дата создания клиента');
      $updatedAt = createItem('td', 'table__cell table__cell--date table__cell--edit-date', '', 'aria-label', 'Дата последнего изменения клиента');
      $contacts = createItem('td', 'table__cell table__cell--contacts', '', '', '');
      $actions = createItem('td', 'table__cell table__cell--actions', '', '', '');
      $editBtn = createItem('button', 'table__btn table__edit-btn', '', 'data-path', 'client-popup');
      $delBtn = createItem('button', 'table__btn table__delete-btn', '', 'data-path', 'del-client-popup');

      $createdAt.innerHTML = `${createdAt} <span>${createTime}</span>`;
      $updatedAt.innerHTML = `${updatedAt} <span>${updateTime}</span>`;
      $editBtn.innerHTML = '<span>Изменить</span>';
      $delBtn.innerHTML = '<span>Удалить</span>';

      $actions.append($editBtn, $delBtn);

      addContactsLinks(client, $contacts);

      clientBtns($editBtn, $delBtn, $row);

      $row.append($id, $fullName, $createdAt, $updatedAt, $contacts, $actions);

      $tableBody.append($row);

    };

    // Функция для управления кнопками Редактирования и Удаления клиента:

    const clientBtns = (edit, del, row) => {

      edit.addEventListener('click', (e) => {
        e.preventDefault();
        openPopup(edit, row.dataset.id);
      });

      del.addEventListener('click', (e) => {
        e.preventDefault();
        openPopup(del, row.dataset.id);
      });

    };

    // Добавляем контакты в таблицу:

    const addContactsLinks = (client, $contacts) => {

      if (client.contacts) {

        client.contacts.forEach((contact) => {
          const $contact = createItem('a', 'table__body-link', '', '', '');
          $contact.classList.add(`table__body-link--${contact.type}`);
          if (contact.type === 'phone') {
            $contact.setAttribute('href', `tel:${contact.value}`);
            $contact.setAttribute('data-tooltip', `Телефон: +7 (${contact.value.slice(2, 5)}) ${contact.value.slice(5, 8)}-${contact.value.slice(8, 10)}-${contact.value.slice(10)}`);
          } else if (contact.type === 'email') {
            $contact.setAttribute('href', `mailto:${contact.value}`);
            $contact.setAttribute('data-tooltip', `Эл. почта: ${contact.value}`);
          } else if (contact.type === 'vk') {
            $contact.setAttribute('href', `${contact.value}`);
            $contact.setAttribute('aria-label', 'ВКонтакте');
            $contact.setAttribute('data-tooltip', `ВКонтакте: ${contact.value}`);
          } else if (contact.type === 'facebook') {
            $contact.setAttribute('href', `${contact.value}`);
            $contact.setAttribute('aria-label', 'Facebook');
            $contact.setAttribute('data-tooltip', `Facebook: ${contact.value}`);
          } else {
            $contact.setAttribute('href', `${contact.value}`);
            $contact.setAttribute('aria-label', 'Контакт клиента');
            $contact.setAttribute('data-tooltip', `Др. контакт: ${contact.value}`);
          };
          if (contact.type === 'vk' || contact.type === 'facebook' || contact.type === 'other') {
            $contact.setAttribute('rel', 'noopener');
            $contact.setAttribute('target', '_blank');
          };
          $contacts.append($contact);
        });
        if ($contacts.getElementsByTagName('a').length > 4) {
          const contactsLinks = [...$contacts.getElementsByTagName('a')];
          const hiddenContacts = contactsLinks.length - 4;
          const $showAllContacts = createItem('a', 'table__body-link', '', '', '');
          $showAllContacts.classList.add('table__body-link--show-all');
          $showAllContacts.setAttribute('href', `#`);
          $showAllContacts.setAttribute('aria-label', 'Показать все контакты');
          $showAllContacts.setAttribute('data-tooltip', `Ещё контакты: ${hiddenContacts}`);
          $showAllContacts.innerHTML = `+${hiddenContacts}`;
          contactsLinks.forEach((el, i) => {
            if (i > 3) {
              el.classList.add('table__body-link--hidden');
            };
          });
          $showAllContacts.addEventListener('click', (e) => {
            e.preventDefault();
            contactsLinks.forEach((el) => {
              if (el.classList.contains('table__body-link--hidden')) {
                el.classList.remove('table__body-link--hidden')
              };
              $showAllContacts.classList.add('table__body-link--hidden');
            });
          });
          $contacts.append($showAllContacts);
        };
      };

    };

    // Общее количество клиентов:

    const totalClients = (filtered) => {
      if (filtered) {
        const $rows = document.querySelectorAll('.table__row');
        $tableFooter.querySelector('th').innerHTML = `Клиентов (фильтр): <span>${$rows.length}</span>`;
        if ($rows.length === 0) {
          $tableFooter.classList.add('table__footer--hidden');
        } else {
          $tableFooter.classList.remove('table__footer--hidden');
        };
      } else {
        $tableFooter.querySelector('th').innerHTML = `Клиентов: <span>${$tableRows.length}</span>`;
        if ($tableRows.length === 0) {
          $tableFooter.classList.add('table__footer--hidden');
        } else {
          $tableFooter.classList.remove('table__footer--hidden');
        };
      }
    };

    // Очистка полей формы модального окна:

    const clearForm = () => {

      $popupFormInputs.forEach((el) => {
        el.parentNode.classList.remove('is-valid', 'is-invalid')
        el.value = '';
        checkPopupInputs(el);
      });
      document.querySelectorAll('.contacts-item').forEach((el) => {
        el.remove();
      });
      checkContactsLength();
      clearError();

    };

    // Блокировка полей формы:

    const lockingForm = () => {
      document.querySelector('.popup--client').classList.add('popup--lock');
    };

    const unlockingForm = () => {
      document.querySelector('.popup--client').classList.remove('popup--lock');
    };

    // Popups:

    const newClientPopup = () => {

      showElement($createClientBtn);
      hideElement($editClientBtn);
      hideElement($deleteClientBtn);
      $popupCancelBtns.forEach((el) => {
        showElement(el);
      });

      $popupTitle.innerHTML = 'Новый клиент';
      $addContactBtn.classList.remove('add-contact-btn--hidden');

    };

    const editClientPopup = async (id, el) => {

      hideElement($createClientBtn);
      showElement($editClientBtn);
      showElement($deleteClientBtn);
      $popupCancelBtns.forEach((el) => {
        hideElement(el);
      });

      let client = typeof el != 'string' ? await getClient(id, el) : await getClient(id);

      $popupTitle.innerHTML = `Изменить данные <span>ID:&nbsp;${id}</span>`;
      $popupInputSurname.value = client.surname;
      $popupInputName.value = client.name;
      if (client.lastName) {
        $popupInputMiddlename.value = client.lastName;
      };
      $popupFormInputs.forEach((el) => {
        checkPopupInputs(el);
      });
      client.contacts.forEach((contact) => {
        addContact(contact.type, contact.value);
      });
      checkContactsLength();

      location.hash = id;

    };

    const openPopup = async (el, id) => {
      let path;
      if (typeof el != 'string') {
        path = el.getAttribute('data-path');
      } else {
        path = el;
      };
      // closePopup();
      const $popup = document.querySelector(`[data-target="${path}"]`);
      if (path === 'client-popup' && !id) {
        newClientPopup();
      } else if (path === 'client-popup' && id) {
        currentClientID = id;
        await editClientPopup(id, el);
      } else if (path === 'del-client-popup' && id) {
        currentClientID = id;
        $popupCancelBtns.forEach((el) => {
          showElement(el);
        });
      };
      $popup.parentNode.classList.add('popup-overlay--visible');
      $popup.classList.add('popup--visible');
      disableScroll();
    };

    const closePopup = async () => {
      $popupOverlay.forEach(el => el.classList.remove('popup-overlay--visible'));
      $popups.forEach((el) => {
        el.classList.remove('popup--visible');
      });
      await delay(800);
      $addContactBtn.classList.add('add-contact-btn--hidden');
      clearForm();
      $popupSubmitBtns.forEach((el) => {
        if (el.classList.contains('_loading') || el.classList.contains('_error')) {
          el.classList.remove('_loading', '_error')
        };
      });
      enableScroll();
    };

    // Сообщение об ошибке при работе с базой данных клиентов:

    const addError = (error) => {
      $errorDescription.forEach((el) => {
        el.innerHTML = error;
      });
    };

    const clearError = () => {
      $errorDescription.forEach((el) => {
        if (el.innerHTML) {
          el.innerHTML = '';
        };
      });
    };

    // Обработчики событий:

    $popupBtns.forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openPopup(el);
      });
    });

    $deleteClientBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closePopup();
      openPopup('del-client-popup', currentClientID);
    });

    $submitDeleteClientBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const deletedClient = await deleteClient(currentClientID, $submitDeleteClientBtn);
      if (deletedClient) {
        closePopup();
        clients.splice(clients.findIndex(client => client.id === deletedClient), 1);
        renderTable(tableFilter(clients));
      };
    });

    $popupCancelBtns.forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        closePopup();
      });
    });

    $popupCloseBtns.forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        closePopup();
      });
    });

    $popupOverlay.forEach((el) => {
      el.addEventListener('click', (e) => {
        if (e.target.classList.contains('popup-overlay')) {
          closePopup();
        };
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        $popupOverlay.forEach((el) => {
          if (el.classList.contains('popup-overlay--visible')) {
            closePopup();
          };
        });
      };
    });

    // Проверка наличия значений в Input'ах модальных окон:

    const checkPopupInputs = (el) => {
      if (!el) {
        $popupFormInputs.forEach((el) => {
          el.addEventListener('input', () => {
            if (el.value.length > 0) {
              el.classList.add('popup__form-input--filled');
            } else {
              el.classList.remove('popup__form-input--filled');
            };
          });
        });
      } else {
        if (el.value.length > 0) {
          el.classList.add('popup__form-input--filled');
        } else {
          el.classList.remove('popup__form-input--filled');
        };
      };
    };

    checkPopupInputs();

    // Choices Select:

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

    // Inputmask:

    const maskInputs = () => {
      const elements = document.querySelectorAll("input[type='tel']");
      const im = new Inputmask("+7 (999) 999-99-99");
      im.mask(elements);
    };

    const removeMask = (el) => {
      if (el.inputmask) {
        el.inputmask.remove();
      };
    };

    // Работа с сервером:

    // Загрузка списка клиентов:

    const url = 'http://localhost:3000/api/clients';

    // Анимация загрузки:

    const startLoadingAnimation = async (el) => {
      el.classList.remove('_error');
      el.classList.add('_loading');
      if (!el.classList.contains('clients__table')) {
        el.setAttribute('disabled', 'true');
      };
      const ms = Math.ceil(Math.random() * (2000 - 1000) + 1000);
      await delay(ms);
    };

    const stopLoadingAnimation = (el) => {
      el.classList.remove('_error', '_loading');
      if (!el.classList.contains('clients__table')) {
        el.removeAttribute('disabled', 'true');
      } else if (el.classList.contains('clients__table')) {
        $newUserBtn.classList.remove('visually-hidden');
      };
    };

    const showLoadingError = (el, message) => {
      el.classList.remove('_loading');
      el.classList.add('_error');
      if (!el.classList.contains('clients__table')) {
        el.removeAttribute('disabled');
      };
      if (message) {
        addError(message);
      };
    };

    // Загрузка массива с данными клиентов:

    const loadClients = async () => {
      try {
        await startLoadingAnimation($clientsTable);
        const response = await fetch(url, {
          method: 'GET',
        });
        if (response.ok) {
          stopLoadingAnimation($clientsTable);
          const data = await response.json();
          return data;
        } else {
          showLoadingError($clientsTable);
        };
      } catch (e) {
        console.error(e);
        showLoadingError($clientsTable);
      };
    };

    // Добавляем клиента:

    const addClient = async (client, el) => {
      console.log(`Добавляем клиента в базу данных...`);
      try {
        await startLoadingAnimation(el);
        const response = await fetch(url, {
          method: 'POST',
          body: JSON.stringify(client),
          headers: {
            'Content-Type': 'application/json'
          },
        });
        if (response.ok) {
          stopLoadingAnimation(el);
          const data = await response.json();
          console.log('Клиент успешно создан:', data);
          return data;
        };
      } catch (e) {
        console.error(e);
        showLoadingError(el, `<p>Возникла ошибка при добавлении клиента, обратитесь к системному администратору. Описание ошибки: ${e}</p>`);
      };
    };

    // Получаем клиента:

    const getClient = async (id, el) => {
      console.log(`Выполняется загрузка данных клиента c ID: ${id}...`);
      try {
        if (el) {
          await startLoadingAnimation(el);
        };
        const response = await fetch(url + `/${id}`, {
          method: 'GET',
        });
        if (response.ok) {
          if (el) {
            stopLoadingAnimation(el);
          };
          const data = await response.json();
          console.log('Данные клиента:', data);
          return data;
        } else {
          if (el) {
            showLoadingError(el);
          };
        };
      } catch (e) {
        console.error(e);
        // el.setAttribute('data-tooltip', 'Ошибка при получении данных');
        if (el) {
          showLoadingError(el);
        };
      };
    };

    // Изменяем клиента:

    const patchClient = async (client, el) => {
      console.log(`Выполняется обновление данных клиента ID: ${client.id}...`);
      try {
        await startLoadingAnimation(el);
        const response = await fetch(url + `/${client.id}`, {
          method: 'PATCH',
          body: JSON.stringify(client),
          headers: {
            'Content-Type': 'application/json'
          },
        });
        if (response.ok) {
          stopLoadingAnimation(el);
          const data = await response.json();
          console.log('Обновлённые данные клиента:', data);
          return data;
        };
      } catch (e) {
        console.error(e);
        showLoadingError(el, `<p>Возникла ошибка при редактировании данных клиента, обратитесь к системному администратору. Описание ошибки: ${e}</p>`);
      };
    };

    // Удаляем клиента:

    const deleteClient = async (id, el) => {
      console.log(`Выполняется удаление клиента ID: ${id}...`);
      try {
        await startLoadingAnimation(el);
        const response = await fetch(url + `/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          stopLoadingAnimation(el);
          // const data = await response.json();
          console.log(`Клиент с ID: ${id} успешно удалён`);
          return id;
        };
      } catch (e) {
        console.error(e);
        showLoadingError(el, `<p>Возникла ошибка при удалении клиента, обратитесь к системному администратору. Описание ошибки: ${e}</p>`);
      };
    };

    // Текущий год в Footer:

    document.querySelector('.footer__year').innerText = new Date().getFullYear();

    // Запуск действиё после загрузки страницы:

    const pageLoaded = async () => {
      console.log('Выполняется загрузка списка клиентов...');
      const data = await loadClients();
      if (data) {
        clients = data.slice(0);
        console.log('Список клиентов:', clients);
        renderTable(clients);
        $tableSort[0].querySelector('span').click();
        document.querySelector('.popups').style.display = "block";
        checkLocationHash();
      };
    };

    pageLoaded();

    const checkLocationHash = () => {
      const hash = location.hash.replace('#', '');
      if (!document.querySelector('.popup--visible')) {
        if (hash != '' && clients.find(client => client.id == hash)) {
          openPopup('client-popup', hash);
        } else if (hash != '' && !clients.find(client => client.id == hash)) {
          console.log('Клиент с таким хешем не найден :(');
        };
      };
    };

    window.onhashchange = checkLocationHash;

  });

})();
