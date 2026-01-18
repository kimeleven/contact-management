// Supabase 설정
// https://supabase.com 에서 프로젝트를 생성하고 아래 값을 교체하세요
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 상태 관리
let currentUser = null;
let currentContact = null;
let allContacts = [];
let isEditMode = false;

// DOM 요소
const loginContainer = document.getElementById('loginContainer');
const mainContainer = document.getElementById('mainContainer');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userEmail = document.getElementById('userEmail');
const searchInput = document.getElementById('searchInput');
const addContactBtn = document.getElementById('addContactBtn');
const contactsList = document.getElementById('contactsList');
const detailView = document.getElementById('detailView');
const emptyState = document.getElementById('emptyState');
const contactModal = document.getElementById('contactModal');
const modalTitle = document.getElementById('modalTitle');
const contactForm = document.getElementById('contactForm');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const deleteModal = document.getElementById('deleteModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const loadingSpinner = document.getElementById('loadingSpinner');

// 입력 필드
const contactName = document.getElementById('contactName');
const contactPhone = document.getElementById('contactPhone');
const contactEmail = document.getElementById('contactEmail');
const contactMemo = document.getElementById('contactMemo');

// 상세 보기 필드
const detailName = document.getElementById('detailName');
const detailPhone = document.getElementById('detailPhone');
const detailEmail = document.getElementById('detailEmail');
const detailMemo = document.getElementById('detailMemo');
const editContactBtn = document.getElementById('editContactBtn');
const deleteContactBtn = document.getElementById('deleteContactBtn');

// ===== 초기화 =====
async function init() {
  try {
    // 현재 세션 확인
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('세션 확인 오류:', error);
      showLoginUI();
      return;
    }

    if (session) {
      currentUser = session.user;
      showMainUI();
      await loadContacts();
    } else {
      showLoginUI();
    }
  } catch (error) {
    console.error('초기화 오류:', error);
    showLoginUI();
  }

  // 세션 변경 감시
  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      currentUser = session.user;
      showMainUI();
      loadContacts();
    } else {
      currentUser = null;
      showLoginUI();
    }
  });
}

// ===== UI 관리 =====
function showLoginUI() {
  loginContainer.style.display = 'flex';
  mainContainer.style.display = 'none';
}

function showMainUI() {
  loginContainer.style.display = 'none';
  mainContainer.style.display = 'flex';
  userEmail.textContent = currentUser.email;
}

function showLoading() {
  loadingSpinner.style.display = 'flex';
}

function hideLoading() {
  loadingSpinner.style.display = 'none';
}

// ===== Google 로그인 =====
async function handleGoogleLogin() {
  try {
    showLoading();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Google 로그인 오류:', error);
    const loginError = document.getElementById('loginError');
    loginError.textContent = '로그인에 실패했습니다. 다시 시도해주세요.';
    loginError.style.display = 'block';
    hideLoading();
  }
}

// ===== 로그아웃 =====
async function handleLogout() {
  try {
    showLoading();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    currentUser = null;
    currentContact = null;
    allContacts = [];
    showLoginUI();
  } catch (error) {
    console.error('로그아웃 오류:', error);
    hideLoading();
  }
}

// ===== 연락처 로드 =====
async function loadContacts() {
  try {
    showLoading();

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    allContacts = data || [];
    renderContactsList(allContacts);
    updateEmptyState();
  } catch (error) {
    console.error('연락처 로드 오류:', error);
    alert('연락처를 불러올 수 없습니다.');
  } finally {
    hideLoading();
  }
}

// ===== 연락처 목록 렌더링 =====
function renderContactsList(contacts) {
  contactsList.innerHTML = '';

  if (contacts.length === 0) {
    return;
  }

  contacts.forEach(contact => {
    const item = document.createElement('button');
    item.className = 'contact-item';
    if (currentContact && currentContact.id === contact.id) {
      item.classList.add('active');
    }

    item.innerHTML = `
      <span class="contact-item-name">${escapeHtml(contact.name)}</span>
      ${contact.phone ? `<span class="contact-item-phone">${escapeHtml(contact.phone)}</span>` : ''}
    `;

    item.addEventListener('click', () => selectContact(contact));
    contactsList.appendChild(item);
  });
}

// ===== 연락처 선택 =====
function selectContact(contact) {
  currentContact = contact;
  isEditMode = false;
  renderContactsList(allContacts);
  displayContactDetail(contact);
}

// ===== 연락처 상세 보기 =====
function displayContactDetail(contact) {
  detailName.textContent = contact.name;

  if (contact.phone) {
    detailPhone.href = `tel:${contact.phone}`;
    detailPhone.textContent = contact.phone;
    detailPhone.parentElement.style.display = 'flex';
  } else {
    detailPhone.parentElement.style.display = 'none';
  }

  if (contact.email) {
    detailEmail.href = `mailto:${contact.email}`;
    detailEmail.textContent = contact.email;
    detailEmail.parentElement.style.display = 'flex';
  } else {
    detailEmail.parentElement.style.display = 'none';
  }

  if (contact.memo) {
    detailMemo.textContent = contact.memo;
    detailMemo.parentElement.style.display = 'flex';
  } else {
    detailMemo.parentElement.style.display = 'none';
  }

  detailView.style.display = 'block';
  emptyState.style.display = 'none';
}

// ===== 연락처 추가 폼 열기 =====
function openAddContactForm() {
  isEditMode = false;
  modalTitle.textContent = '새 연락처';
  contactForm.reset();
  contactModal.style.display = 'flex';
  contactName.focus();
}

// ===== 연락처 수정 폼 열기 =====
function openEditContactForm() {
  if (!currentContact) return;

  isEditMode = true;
  modalTitle.textContent = '연락처 수정';
  contactName.value = currentContact.name;
  contactPhone.value = currentContact.phone || '';
  contactEmail.value = currentContact.email || '';
  contactMemo.value = currentContact.memo || '';
  contactModal.style.display = 'flex';
  contactName.focus();
}

// ===== 모달 닫기 =====
function closeModal() {
  contactModal.style.display = 'none';
  contactForm.reset();
}

// ===== 폼 제출 =====
async function handleFormSubmit(e) {
  e.preventDefault();

  // 유효성 검사
  const name = contactName.value.trim();
  if (!name) {
    showError('nameError', '이름을 입력해주세요.');
    return;
  }

  const phone = contactPhone.value.trim();
  const email = contactEmail.value.trim();
  const memo = contactMemo.value.trim();

  // 이메일 유효성 검사
  if (email && !isValidEmail(email)) {
    showError('nameError', '유효한 이메일을 입력해주세요.');
    return;
  }

  try {
    showLoading();
    clearErrors();

    const contactData = {
      name,
      phone: phone || null,
      email: email || null,
      memo: memo || null
    };

    let result;
    if (isEditMode) {
      // 업데이트
      result = await supabase
        .from('contacts')
        .update(contactData)
        .eq('id', currentContact.id);
    } else {
      // 삽입
      contactData.user_id = currentUser.id;
      result = await supabase
        .from('contacts')
        .insert([contactData]);
    }

    if (result.error) {
      throw result.error;
    }

    closeModal();
    await loadContacts();

    // 새로 추가된 연락처 자동 선택
    if (!isEditMode) {
      const newContact = allContacts.find(c => c.name === name && c.phone === (phone || null));
      if (newContact) {
        selectContact(newContact);
      }
    }
  } catch (error) {
    console.error('저장 오류:', error);
    showError('nameError', '저장에 실패했습니다. 다시 시도해주세요.');
  } finally {
    hideLoading();
  }
}

// ===== 연락처 삭제 =====
function openDeleteConfirm() {
  if (!currentContact) return;
  deleteModal.style.display = 'flex';
}

async function confirmDelete() {
  if (!currentContact) return;

  try {
    showLoading();
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', currentContact.id);

    if (error) {
      throw error;
    }

    deleteModal.style.display = 'none';
    currentContact = null;
    await loadContacts();
    detailView.style.display = 'none';
    emptyState.style.display = 'flex';
  } catch (error) {
    console.error('삭제 오류:', error);
    alert('삭제에 실패했습니다. 다시 시도해주세요.');
    deleteModal.style.display = 'none';
  } finally {
    hideLoading();
  }
}

// ===== 검색 기능 =====
function handleSearch(query) {
  const searchTerm = query.toLowerCase().trim();

  if (!searchTerm) {
    renderContactsList(allContacts);
    return;
  }

  const filtered = allContacts.filter(contact => {
    const name = (contact.name || '').toLowerCase();
    const phone = (contact.phone || '').toLowerCase();
    const email = (contact.email || '').toLowerCase();

    return name.includes(searchTerm) ||
           phone.includes(searchTerm) ||
           email.includes(searchTerm);
  });

  renderContactsList(filtered);
}

// ===== 유틸리티 함수 =====
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }
}

function clearErrors() {
  const errorElements = document.querySelectorAll('.error-message');
  errorElements.forEach(el => {
    el.textContent = '';
    el.classList.remove('show');
  });
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateEmptyState() {
  if (allContacts.length === 0 && !currentContact) {
    emptyState.style.display = 'flex';
    detailView.style.display = 'none';
  }
}

// ===== 이벤트 리스너 =====
googleLoginBtn.addEventListener('click', handleGoogleLogin);
logoutBtn.addEventListener('click', handleLogout);
addContactBtn.addEventListener('click', openAddContactForm);
editContactBtn.addEventListener('click', openEditContactForm);
deleteContactBtn.addEventListener('click', openDeleteConfirm);
closeModalBtn.addEventListener('click', closeModal);
cancelFormBtn.addEventListener('click', closeModal);
cancelDeleteBtn.addEventListener('click', () => {
  deleteModal.style.display = 'none';
});
confirmDeleteBtn.addEventListener('click', confirmDelete);
contactForm.addEventListener('submit', handleFormSubmit);
searchInput.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});

// 모달 밖의 영역을 클릭하면 닫기
contactModal.addEventListener('click', (e) => {
  if (e.target === contactModal) {
    closeModal();
  }
});

deleteModal.addEventListener('click', (e) => {
  if (e.target === deleteModal) {
    deleteModal.style.display = 'none';
  }
});

// Escape 키로 모달 닫기
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    deleteModal.style.display = 'none';
  }
});

// 앱 초기화
init();
