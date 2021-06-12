"use strict";

(() => {

  document.addEventListener('DOMContentLoaded', () => {

    const $tableFilter = document.querySelector('.search__input');
    const $clientsTable = document.querySelector('.clients__table');
    const $tableSort = document.querySelectorAll('.table__head-cell--sortable');
    const $tableBody = document.querySelector('.table__body');
    const $tableRows = $tableBody.getElementsByTagName('tr');
    const $tableFooter = document.querySelector('.table__footer');
    const $popupBtns = document.querySelectorAll('.popup-btn');
    const $popupOverlay = document.querySelector('.popup-overlay');
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
    const $createClientBtn = document.querySelector('.popup__form-submit');
    const $editClientBtn = document.querySelector('.popup__form-edit');
    const $popupCancelBtns = document.querySelectorAll('.popup__cancel-btn');
    const $deleteClientBtn = document.querySelector('.popup__delete-btn');
    const $submitDeleteClientBtn = document.querySelector('.popup__del-submit');

    const clients = [];

    let currentClientID;

    // Сортировка таблицы:

    $tableSort.forEach((item) => item.querySelector('span').addEventListener('click', () => {
      if (!item.classList.contains('table__head-cell--sorted', 'table__head-cell--reversed') || item.classList.contains('table__head-cell--reversed')) {
        $tableSort.forEach(el => el.classList.remove('table__head-cell--sorted', 'table__head-cell--reversed'));
        item.classList.add('table__head-cell--sorted');
        if (item.dataset.sort == 0) {
          numbersSort(item.dataset.sort);
        } else if (item.dataset.sort == 1) {
          textSort(item.dataset.sort);
        } else if (item.dataset.sort == 2 || item.dataset.sort == 3) {
          dateSort(item.dataset.sort);
        };
      } else if (item.classList.contains('table__head-cell--sorted')) {
        item.classList.replace('table__head-cell--sorted', 'table__head-cell--reversed');
        if (item.dataset.sort == 0) {
          numbersSort(item.dataset.sort, true);
        } else if (item.dataset.sort == 1) {
          textSort(item.dataset.sort, true);
        } else if (item.dataset.sort == 2 || item.dataset.sort == 3) {
          dateSort(item.dataset.sort, true);
        };
      };
    }));

    const numbersSort = (column, reversed) => {
      let sortedRows = Array.from($tableRows);
      if (!reversed) {
        sortedRows.sort((rowA, rowB) => rowA.cells[column].innerText - rowB.cells[column].innerText);
      } else {
        sortedRows.sort((rowA, rowB) => rowB.cells[column].innerText - rowA.cells[column].innerText);
      };
      $clientsTable.tBodies[0].append(...sortedRows);
    };

    const textSort = (column, reversed) => {
      let sortedRows = Array.from($tableRows);
      if (!reversed) {
        sortedRows.sort((rowA, rowB) => rowA.cells[column].innerText > rowB.cells[column].innerText ? 1 : -1);
      } else {
        sortedRows.sort((rowA, rowB) => rowA.cells[column].innerText > rowB.cells[column].innerText ? -1 : 1);
      };
      $clientsTable.tBodies[0].append(...sortedRows);
    };

    const dateSort = (column, reversed) => {
      let sortedRows = Array.from($tableRows);
      if (!reversed) {
        sortedRows.sort((rowA, rowB) => rowA.cells[column].dataset.date - rowB.cells[column].dataset.date);
      } else {
        sortedRows.sort((rowA, rowB) => rowB.cells[column].dataset.date - rowA.cells[column].dataset.date);
      };
      $clientsTable.tBodies[0].append(...sortedRows);
    };

    // Фильтрация таблицы:

    $tableFilter.addEventListener('input', () => {
      Array.from($tableBody.querySelectorAll('tr')).forEach((el) => {
        if (!el.classList.contains('table__row--hidden')) {
          el.classList.add('table__row--hidden');
        };
      });
      tableFilter();
    });

    const tableFilter = () => {
      let filterededRows = Array.from($tableRows).filter((row) => {
        return row.cells[0].innerText.toLowerCase().includes($tableFilter.value.toLowerCase()) ||
          row.cells[1].innerText.toLowerCase().includes($tableFilter.value.toLowerCase()) ||
          row.cells[2].innerText.toLowerCase().includes($tableFilter.value.toLowerCase()) ||
          row.cells[3].innerText.toLowerCase().includes($tableFilter.value.toLowerCase())
      });
      filterededRows.forEach(el => el.classList.remove('table__row--hidden'));
      if ($tableFilter.value) {
        $tableBody.classList.add('table--filtered');
        totalClients(true);
      } else {
        $tableBody.classList.remove('table--filtered');
        totalClients(false);
      };
    };

    // Create New Contact:

    $addContactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      addContact();
      checkContactsLength();
    });

    const addContact = (value, data) => {
      if (value) {
        value = value.includes('_') ? value.split('_').join('') : value;
      };
      const contact = createNewContact(value, data);
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

    const createNewContact = (value, data) => {

      const $contactBlock = createItem('div', 'form-contacts__item contacts-item', '', '', );
      const $select = createItem('select', 'contacts-item__select', '', 'name', 'contacts');
      const $option1 = createItem('option', '', 'Телефон', 'value', 'phone');
      const $option2 = createItem('option', '', 'Доп. телефон', 'value', 'add-phone');
      const $option3 = createItem('option', '', 'Email', 'value', 'email');
      const $option4 = createItem('option', '', 'ВКонтакте', 'value', 'vk');
      const $option5 = createItem('option', '', 'Facebook', 'value', 'facebook');
      const $option6 = createItem('option', '', 'Другое', 'value', 'other');
      const $input = createItem('input', 'contacts-item__input', '', 'type', 'tel');
      const $delBtn = createItem('button', 'contacts-item__delete-btn', '', '', '');

      $select.setAttribute('aria-label', 'Выбор способа связи');
      $input.setAttribute('placeholder', 'Введите данные контакта');

      $select.append($option1, $option2, $option3, $option4, $option5, $option6);
      $contactBlock.append($select, $input, $delBtn);

      if (value && data) {
        $select.value = value;
        $input.value = data;
        changeInputType($input, value);
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
      if (value === 'phone' || value === 'add-phone') {
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

    // Create Item:

    const createItem = (element = 'div', className = '', value = '', attrName, attrValue) => {
      const item = document.createElement(element);
      item.setAttribute('class', className);
      item.textContent = value;
      if (attrName && attrValue) {
        item.setAttribute(attrName, attrValue);
      };
      return item;
    };

    // Создание нового клиента:

    $createClientBtn.addEventListener('click', (e) => {
      e.preventDefault();
      let error = formValidate($popupForm);
      if (error === 0) {
        console.log('Создаём нового клиента!');
        createClient('', $popupInputSurname.value, $popupInputName.value, $popupInputMiddlename.value, $contactsBlock);
        // closePopup();
        clearForm();
        $popupFormInputs.forEach(
          input => input.parentNode.classList.remove('is-valid')
        );
      };
    });

    const createClient = (id, surname, name, middlename, contactsBlock, createDate, editDate) => {

      const client = new Object();

      if (!id) {
        client.id = getID();
      } else {
        client.id = id;
      };
      if (createDate && editDate) {
        client.createDate = createDate;
        client.editDate = editDate;
      } else {
        client.createDate = new Date();
        client.editDate = client.createDate;
      };
      client.surname = surname;
      client.name = name;
      if (middlename) {
        client.middlename = middlename;
      };
      if (contactsBlock) {
        const clientContacts = new Object();
        if (id) {
          for (let contact in contactsBlock) {
            clientContacts[contact] = contactsBlock[contact];
          };
          client.contacts = clientContacts;
        } else {
          addContacts(client, clientContacts, contactsBlock);
        };
      };

      clients.push(client);
      tableRow(client, false);
      toLocal('clients');

    };

    // Редактирование клиента:

    $editClientBtn.addEventListener('click', (e) => {
      e.preventDefault();
      let error = formValidate($popupForm);
      if (error === 0) {
        console.log('Изменяем данные клиента!');
        editClient(currentClientID, $popupInputSurname.value, $popupInputName.value, $popupInputMiddlename.value, $contactsBlock);
        closePopup();
        $popupFormInputs.forEach(
          input => input.parentNode.classList.remove('is-valid')
        );
      };
    });

    const editClient = (id, surname, name, middlename, contactsBlock) => {
      const client = clients[clients.findIndex(client => client.id == id)];
      client.editDate = new Date();
      if (client.contacts) {
        delete client.contacts;
      };
      client.surname = surname;
      client.name = name;
      client.middlename = middlename;
      if (contactsBlock) {
        const clientContacts = new Object();
        addContacts(client, clientContacts, contactsBlock);
      };
      tableRow(client, true);
      toLocal('clients');
    };

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
        if (contactType === 'phone' || contactType === 'add-phone') {
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
        if (contactType === 'phone' || contactType === 'add-phone') {
          input.parentNode.setAttribute('data-tooltip', 'Проверьте длину номера телефона');
        };
        if (contactType === 'email') {
          input.parentNode.setAttribute('data-tooltip', 'Проверьте правильность ввода e-mail');
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

    // Добавляем контакты к объекту клиента:

    const addContacts = (client, clientContacts, contactsBlock) => {
      const contacts = contactsBlock.querySelectorAll('.contacts-item');
      if (contacts.length != 0) {
        contacts.forEach((el) => {
          const input = el.querySelector('.contacts-item__input');
          const attr = findContactsCoincidence(clientContacts, input.getAttribute('data-value'));
          let value;
          if (input.inputmask) {
            value = input.inputmask.unmaskedvalue();
          } else {
            value = input.value;
          };
          if (value.length > 1) {
            clientContacts[attr] = value;
          };
        });
        client.contacts = clientContacts;
      };
    };

    // Поиск совпадений ключей в объекте, и, если найдено - добавление к ключу спец. символа '_':

    const findContactsCoincidence = (clientContacts, value) => {
      for (let key in clientContacts) {
        if (key === value) {
          value += '_';
        };
      };
      return value;
    };

    // Ряд в таблице:

    const tableRow = (client, edit) => {

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

      const fullName = client.middlename ? `${client.surname} ${client.name} ${client.middlename}` : `${client.surname} ${client.name}`;
      const createDate = new Date(client.createDate).toLocaleDateString();
      const createTime = getTime(new Date(client.createDate));
      const editDate = new Date(client.editDate).toLocaleDateString();
      const editTime = getTime(new Date(client.editDate));

      if (edit) {
        editTableRow(client, fullName, editDate, editTime);
      } else {
        newTableRow(client, fullName, createDate, createTime, editDate, editTime);
      };

      totalClients(false);

    };

    // Функция создания ряда таблицы:

    const newTableRow = (client, fullName, createDate, createTime, editDate, editTime) => {

      let $row, $id, $fullName, $createDate, $editDate, $contacts, $actions, $editBtn, $delBtn;

      $row = createItem('tr', 'table__row', '', 'data-id', client.id);
      $id = createItem('td', 'table__cell table__cell--id', `${client.id}`, '', '');
      $fullName = createItem('td', 'table__cell table__cell--name', fullName, '', '');
      $createDate = createItem('td', 'table__cell table__cell--date table__cell--create-date', '', 'aria-label', 'Дата создания клиента');
      $editDate = createItem('td', 'table__cell table__cell--date table__cell--edit-date', '', 'aria-label', 'Дата последнего изменения клиента');
      $contacts = createItem('td', 'table__cell table__cell--contacts', '', '', '');
      $actions = createItem('td', 'table__cell table__cell--actions', '', '', '');
      $editBtn = createItem('button', 'table__btn table__edit-btn', '', 'data-path', 'client-popup');
      $delBtn = createItem('button', 'table__btn table__delete-btn', '', 'data-path', 'del-client-popup');

      $createDate.innerHTML = `${createDate} <span>${createTime}</span>`;
      $createDate.setAttribute('data-date', `${new Date(client.createDate) - new Date(0)}`);
      $editDate.innerHTML = `${editDate} <span>${editTime}</span>`;
      $editDate.setAttribute('data-date', `${new Date(client.editDate) - new Date(0)}`);
      $editBtn.innerHTML = '<span>Изменить</span>';
      $delBtn.innerHTML = '<span>Удалить</span>';

      $actions.append($editBtn, $delBtn);

      addContactsLinks(client, $contacts);

      clientBtns($editBtn, $delBtn, $row);

      $row.append($id, $fullName, $createDate, $editDate, $contacts, $actions);

      $tableBody.append($row);

    };

    // Функция редактирования ряда таблицы:

    const editTableRow = (client, fullName, editDate, editTime) => {

      let $row, $id, $fullName, $createDate, $editDate, $contacts, $actions, $editBtn, $delBtn;

      $row = document.querySelector(`[data-id="${client.id}"]`);
      $id = $row.querySelector('.table__cell--id');
      $fullName = $row.querySelector('.table__cell--name');
      $createDate = $row.querySelector('.table__cell--create-date');
      $editDate = $row.querySelector('.table__cell--edit-date');
      $contacts = $row.querySelector('.table__cell--contacts');
      $actions = $row.querySelector('.table__cell--actions');
      $editBtn = $row.querySelector('.table__edit-btn');
      $delBtn = $row.querySelector('.table__delete-btn');

      $fullName.innerText = fullName;
      $editDate.innerHTML = `${editDate} <span>${editTime}</span>`;
      $editDate.setAttribute('data-date', `${new Date(client.editDate) - new Date(0)}`);
      $editBtn.innerHTML = '<span>Изменить</span>';
      $delBtn.innerHTML = '<span>Удалить</span>';

      if (client.contacts) {
        clearContacts(client.id);
      };

      addContactsLinks(client, $contacts);

      clientBtns($editBtn, $delBtn, $row);

      $row.append($id, $fullName, $createDate, $editDate, $contacts, $actions);

    };

    // Функция для управления кнопками Редиктирования и Удаления клиента:

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
        for (let contact in client.contacts) {
          const $contact = createItem('a', 'table__body-link', '', '', '');
          if (contact.includes('phone')) {
            $contact.classList.add('table__body-link--phone');
            $contact.setAttribute('href', `tel:+7${client.contacts[contact]}`);
            $contact.setAttribute('data-tooltip', `Телефон: +7 (${client.contacts[contact].slice(0, 3)}) ${client.contacts[contact].slice(3, 6)}-${client.contacts[contact].slice(6, 8)}-${client.contacts[contact].slice(8)}`);
          } else if (contact.includes('email')) {
            $contact.classList.add('table__body-link--mail');
            $contact.setAttribute('href', `mailto:${client.contacts[contact]}`);
            $contact.setAttribute('data-tooltip', `Эл. почта: ${client.contacts[contact]}`);
          } else if (contact.includes('vk')) {
            $contact.classList.add('table__body-link--vk');
            $contact.setAttribute('href', `${client.contacts[contact]}`);
            $contact.setAttribute('aria-label', 'ВКонтакте');
            $contact.setAttribute('data-tooltip', `ВКонтакте: ${client.contacts[contact]}`);
          } else if (contact.includes('facebook')) {
            $contact.classList.add('table__body-link--facebook');
            $contact.setAttribute('href', `${client.contacts[contact]}`);
            $contact.setAttribute('aria-label', 'Facebook');
            $contact.setAttribute('data-tooltip', `Facebook: ${client.contacts[contact]}`);
          } else {
            $contact.classList.add('table__body-link--other');
            $contact.setAttribute('href', `${client.contacts[contact]}`);
            $contact.setAttribute('aria-label', 'Контакт клиента');
            $contact.setAttribute('data-tooltip', `Др. контакт: ${client.contacts[contact]}`);
          };
          if (contact.includes('vk') || contact.includes('facebook') || contact.includes('other')) {
            $contact.setAttribute('rel', 'noopener');
            $contact.setAttribute('target', '_blank');
          };
          $contacts.append($contact);
        };
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

    // Удаление клиента:

    const removeClient = (id) => {

      clients.splice(clients.findIndex(client => client.id == id), 1);
      document.querySelector(`[data-id="${id}"]`).remove();
      console.log(`Клиент с ID: ${id} удалён`);
      toLocal('clients');
      totalClients(false);

    };

    // Удаление всех контактов клиента:

    const clearContacts = (id) => {

      const $row = document.querySelector(`[data-id="${id}"]`);
      const $contactsLinks = $row.querySelectorAll('.table__body-link');
      $contactsLinks.forEach((el) => {
        el.remove();
      });

    };

    // Получение ID клиента:

    const getID = () => {

      // let id = 100000 + clients.length;
      let id = Math.floor(Math.random() * 100000);
      return id;

    };

    // Общее количество клиентов:

    const totalClients = (filtered) => {
      if (filtered) {
        const $rows = document.querySelectorAll('.table__row:not(.table__row--hidden)');
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

    // Очистка полей формы:

    const clearForm = () => {

      $popupFormInputs.forEach((el) => {
        el.value = '';
        checkPopupInputs(el);
      });
      document.querySelectorAll('.contacts-item').forEach((el) => {
        el.remove();
        checkContactsLength();
      });

    };

    // Popups:

    const newClientPopup = () => {

      $popupTitle.innerHTML = 'Новый клиент';

    };

    const editClientPopup = (id) => {

      const $client = clients[clients.findIndex(client => client.id == id)];
      $popupTitle.innerHTML = `Изменить данные <span>ID: ${id}</span>`;
      $popupInputSurname.value = $client.surname;
      $popupInputName.value = $client.name;
      if ($client.middlename) {
        $popupInputMiddlename.value = $client.middlename;
      };
      $popupFormInputs.forEach((el) => {
        checkPopupInputs(el);
      });
      for (let contact in $client.contacts) {
        addContact(contact, $client.contacts[contact]);
        checkContactsLength();
      };

    };

    const openPopup = (el, id) => {
      let path;
      if (typeof el != 'string') {
        path = el.getAttribute('data-path');
      } else {
        path = el;
      };
      closePopup();
      document.querySelector(`[data-target="${path}"]`).classList.add('popup--visible');
      $popupOverlay.classList.add('popup-overlay--visible');
      if (path === 'client-popup' && !id) {
        $createClientBtn.style.display = 'block';
        $editClientBtn.style.display = 'none';
        $deleteClientBtn.style.display = 'none';
        $popupCancelBtns.forEach((el) => {
          el.style.display = 'block';
        });
        newClientPopup();
      } else if (path === 'client-popup' && id) {
        currentClientID = id;
        $createClientBtn.style.display = 'none';
        $editClientBtn.style.display = 'block';
        $deleteClientBtn.style.display = 'block';
        $popupCancelBtns.forEach((el) => {
          el.style.display = 'none';
        });
        editClientPopup(id);
      } else if (path === 'del-client-popup' && id) {
        currentClientID = id;
        $popupCancelBtns.forEach((el) => {
          el.style.display = 'block';
        });
      };
    };

    const closePopup = () => {
      clearForm();
      $popupOverlay.classList.remove('popup-overlay--visible');
      $popups.forEach((el) => {
        el.classList.remove('popup--visible');
      });
      $popupFormInputs.forEach(
        input => input.parentNode.classList.remove('is-valid', 'is-invalid')
      );
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
      openPopup('del-client-popup', currentClientID);
    });

    $submitDeleteClientBtn.addEventListener('click', (e) => {
      console.log('Удаляем клиента!');
      e.preventDefault();
      removeClient(currentClientID);
      closePopup();
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

    $popupOverlay.addEventListener('click', (e) => {
      if (e.target === $popupOverlay) {
        closePopup();
      };
    });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && $popupOverlay.classList.contains('popup-overlay--visible')) {
        closePopup();
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
    }

    // LocalStorage:

    const toLocal = (clientsList) => {
      localStorage.setItem([clientsList.toString()], JSON.stringify(clients));
    };

    const fromLocal = (clientsList) => {
      if (JSON.parse(localStorage[clientsList.toString()]).length != 0) {
        const list = JSON.parse(localStorage[clientsList.toString()]);
        for (let i = 0; i < list.length; i++) {
          createClient(list[i].id, list[i].surname, list[i].name, list[i].middlename, list[i].contacts, list[i].createDate, list[i].editDate);
        };
      };
    };

    if (localStorage['clients']) {
      fromLocal('clients');
      console.log(clients);
    };

    // Текущий год в Footer:

    document.querySelector('.footer__year').innerText = new Date().getFullYear();

    totalClients(false);

    $tableSort[0].querySelector('span').click();

  });

})();