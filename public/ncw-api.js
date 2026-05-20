(function () {
  const USER_KEY = "ncw-user-id";
  const USER_DATA_KEY = "ncw-users";
  const CART_KEY = "ncw-cart";
  const INVENTORY_KEY = "ncw-inventory";
  const PURCHASES_KEY = "ncw-purchases";
  const GOOGLE_KEY = "ncw-google-demo";

  const PRODUCT_IMAGES = {
    "tee-01": "https://images.pexels.com/photos/6311595/pexels-photo-6311595.jpeg?auto=compress&cs=tinysrgb&w=900",
    "hood-02": "https://images.pexels.com/photos/6311656/pexels-photo-6311656.jpeg?auto=compress&cs=tinysrgb&w=900",
    "blouse-06": "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=900",
    "pants-03": "https://images.pexels.com/photos/7679652/pexels-photo-7679652.jpeg?auto=compress&cs=tinysrgb&w=900",
    "short-07": "https://images.pexels.com/photos/6311581/pexels-photo-6311581.jpeg?auto=compress&cs=tinysrgb&w=900",
    "shoe-04": "https://images.pexels.com/photos/6540980/pexels-photo-6540980.jpeg?auto=compress&cs=tinysrgb&w=900",
    "cap-05": "https://images.pexels.com/photos/5698853/pexels-photo-5698853.jpeg?auto=compress&cs=tinysrgb&w=900",
  };
  const CATEGORY_IMAGES = {
    camisetas: PRODUCT_IMAGES["tee-01"],
    moletons: PRODUCT_IMAGES["hood-02"],
    blusas: PRODUCT_IMAGES["blouse-06"],
    calcas: PRODUCT_IMAGES["pants-03"],
    bermudas: PRODUCT_IMAGES["short-07"],
    tenis: PRODUCT_IMAGES["shoe-04"],
    acessorios: PRODUCT_IMAGES["cap-05"],
  };

  const INITIAL_INVENTORY = [
    { id: "tee-01", name: "Camiseta Box NCW", category: "Camisetas", stock: 42, price: 109.9, color: "#f4f1ea", status: "Ativo" },
    { id: "hood-02", name: "Hoodie Graphite", category: "Moletons", stock: 18, price: 219.9, color: "#52616f", status: "Ativo" },
    { id: "blouse-06", name: "Blusa Rib Studio", category: "Blusas", stock: 30, price: 159.9, color: "#d8bda8", status: "Ativo" },
    { id: "pants-03", name: "Cargo Sand", category: "Calcas", stock: 25, price: 249.9, color: "#b4a68b", status: "Ativo" },
    { id: "short-07", name: "Bermuda Utility", category: "Bermudas", stock: 16, price: 149.9, color: "#8c927d", status: "Ativo" },
    { id: "shoe-04", name: "Sneaker Cloud", category: "Tenis", stock: 12, price: 329.9, color: "#e7edf1", status: "Baixo estoque" },
    { id: "cap-05", name: "Bone Logo", category: "Acessorios", stock: 9, price: 89.9, color: "#2f3437", status: "Baixo estoque" },
  ];

  const INITIAL_LOOKS = [
    { id: "look-urban-rain", title: "Urban rain", author: "Marina Costa", image: "https://images.pexels.com/photos/33469138/pexels-photo-33469138.jpeg?auto=compress&cs=tinysrgb&w=900" },
    { id: "look-training-day", title: "Training day", author: "Rafael Nunes", image: "https://images.pexels.com/photos/4004222/pexels-photo-4004222.jpeg?auto=compress&cs=tinysrgb&w=900" },
    { id: "look-city-core", title: "City core", author: "Leo Andrade", image: "https://images.pexels.com/photos/29212401/pexels-photo-29212401.jpeg?auto=compress&cs=tinysrgb&w=900" },
    { id: "look-soft-office", title: "Soft office", author: "Bianca Torres", image: "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=900" },
    { id: "look-weekend", title: "Weekend drop", author: "Caio Lima", image: "https://images.pexels.com/photos/6311394/pexels-photo-6311394.jpeg?auto=compress&cs=tinysrgb&w=900" },
    { id: "look-tonal", title: "Tonal layers", author: "Duda Alves", image: "https://images.pexels.com/photos/7671168/pexels-photo-7671168.jpeg?auto=compress&cs=tinysrgb&w=900" },
  ];

  const DEMO_USER = {
    id: "user-demo",
    loginName: "demo",
    password: "demo123",
    displayName: "Cliente Demo",
    theme: "clean",
    layout: "market",
    privacy: "private",
    accent: "#2f5d50",
    savedLooks: "look-urban-rain,look-weekend",
  };

  function readJson(key, fallback) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function ensureSeedData() {
    if (!localStorage.getItem(INVENTORY_KEY)) writeJson(INVENTORY_KEY, INITIAL_INVENTORY);
    if (!localStorage.getItem(USER_DATA_KEY)) writeJson(USER_DATA_KEY, [DEMO_USER]);
    if (!localStorage.getItem(PURCHASES_KEY)) {
      writeJson(PURCHASES_KEY, {
        "user-demo": [
          { id: "NCW-1029", title: "Pedido Urban rain", createdAt: "12/05/2026", status: "Pago", total: 389.7 },
          { id: "NCW-1021", title: "Pedido Training day", createdAt: "09/05/2026", status: "Enviado", total: 299.9 },
        ],
      });
    }
  }

  function response(data) {
    return Promise.resolve(clone(data));
  }

  function parseBody(options) {
    if (!options.body) return {};
    return typeof options.body === "string" ? JSON.parse(options.body) : options.body;
  }

  function publicUser(user) {
    const { password, ...rest } = user;
    return rest;
  }

  function findUser(id) {
    return readJson(USER_DATA_KEY, []).find((user) => user.id === id);
  }

  async function request(path, options = {}) {
    ensureSeedData();
    const method = (options.method || "GET").toUpperCase();
    const cleanPath = path.split("?")[0];

    if (cleanPath === "/inventory" && method === "GET") return response(readJson(INVENTORY_KEY, []));

    if (cleanPath === "/inventory" && method === "POST") {
      const products = readJson(INVENTORY_KEY, []);
      const payload = parseBody(options);
      const id = `${String(payload.category || "item").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").slice(0, 4)}-${Date.now().toString(36)}`;
      const product = { id, ...payload };
      products.push(product);
      writeJson(INVENTORY_KEY, products);
      return response(product);
    }

    const inventoryMatch = cleanPath.match(/^\/inventory\/([^/]+)$/);
    if (inventoryMatch && method === "POST") {
      const id = decodeURIComponent(inventoryMatch[1]);
      const products = readJson(INVENTORY_KEY, []);
      const index = products.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("product_not_found");
      products[index] = { ...products[index], ...parseBody(options), id };
      writeJson(INVENTORY_KEY, products);
      return response(products[index]);
    }
    if (inventoryMatch && method === "DELETE") {
      const id = decodeURIComponent(inventoryMatch[1]);
      writeJson(INVENTORY_KEY, readJson(INVENTORY_KEY, []).filter((item) => item.id !== id));
      return response(null);
    }

    if (cleanPath === "/looks" && method === "GET") return response(INITIAL_LOOKS);

    if (cleanPath === "/sessions" && method === "POST") {
      const payload = parseBody(options);
      const user = readJson(USER_DATA_KEY, []).find((item) => item.loginName === payload.loginName && item.password === payload.password);
      if (!user) throw new Error("invalid_login");
      return response(publicUser(user));
    }

    if (cleanPath === "/users" && method === "POST") {
      const users = readJson(USER_DATA_KEY, []);
      const payload = parseBody(options);
      if (users.some((user) => user.loginName === payload.loginName)) throw new Error("login_exists");
      const user = {
        id: `user-${Date.now().toString(36)}`,
        loginName: payload.loginName,
        password: payload.password,
        displayName: payload.displayName || payload.loginName,
        theme: "clean",
        layout: "market",
        privacy: "private",
        accent: "#2f5d50",
        savedLooks: "",
      };
      users.push(user);
      writeJson(USER_DATA_KEY, users);
      return response(publicUser(user));
    }

    const userMatch = cleanPath.match(/^\/users\/([^/]+)$/);
    if (userMatch && method === "GET") {
      const user = findUser(decodeURIComponent(userMatch[1]));
      if (!user) throw new Error("user_not_found");
      return response(publicUser(user));
    }
    if (userMatch && method === "POST") {
      const id = decodeURIComponent(userMatch[1]);
      const users = readJson(USER_DATA_KEY, []);
      const index = users.findIndex((user) => user.id === id);
      if (index < 0) throw new Error("user_not_found");
      users[index] = { ...users[index], ...parseBody(options), id };
      writeJson(USER_DATA_KEY, users);
      return response(publicUser(users[index]));
    }

    const purchaseMatch = cleanPath.match(/^\/users\/([^/]+)\/purchases$/);
    if (purchaseMatch && method === "GET") {
      const userId = decodeURIComponent(purchaseMatch[1]);
      return response(readJson(PURCHASES_KEY, {})[userId] || []);
    }
    if (purchaseMatch && method === "POST") {
      const userId = decodeURIComponent(purchaseMatch[1]);
      const purchases = readJson(PURCHASES_KEY, {});
      const item = { id: `NCW-${Date.now().toString().slice(-4)}`, status: "Registrado", ...parseBody(options) };
      purchases[userId] = [item, ...(purchases[userId] || [])];
      writeJson(PURCHASES_KEY, purchases);
      return response(item);
    }

    throw new Error("static_route_not_found");
  }

  function money(value) {
    return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function getCart() {
    return readJson(CART_KEY, []);
  }

  function setCart(items) {
    writeJson(CART_KEY, items);
    window.dispatchEvent(new CustomEvent("ncw:cart"));
  }

  function addToCart(item) {
    const cart = getCart();
    const existing = cart.find((current) => current.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    setCart(cart);
  }

  function imageForProduct(item) {
    const category = String(item.category || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return item.image || PRODUCT_IMAGES[item.id] || CATEGORY_IMAGES[category] || PRODUCT_IMAGES["tee-01"];
  }

  function removeFromCart(id) {
    setCart(getCart().filter((item) => item.id !== id));
  }

  function currentUserId() {
    return localStorage.getItem(USER_KEY);
  }

  function setCurrentUser(user) {
    localStorage.setItem(USER_KEY, user.id);
    writeJson("ncw-user", user);
    applyPreferences(user);
  }

  function clearCurrentUser() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("ncw-user");
  }

  function applyPreferences(user) {
    if (!user) return;
    document.documentElement.dataset.theme = user.theme || localStorage.getItem("ncw-theme") || "clean";
    document.documentElement.dataset.layout = user.layout || "market";
    document.documentElement.style.setProperty("--accent", user.accent || "#2f5d50");
    localStorage.setItem("ncw-theme", document.documentElement.dataset.theme);
    localStorage.setItem("ncw-layout", document.documentElement.dataset.layout);
    localStorage.setItem("ncw-accent", user.accent || "#2f5d50");
  }

  async function loadCurrentUser() {
    const userId = currentUserId();
    if (!userId) return null;
    const user = await request(`/users/${encodeURIComponent(userId)}`);
    setCurrentUser(user);
    return user;
  }

  async function signInWithGoogleDemo() {
    ensureSeedData();
    const stored = readJson(GOOGLE_KEY, null);
    if (stored && stored.id) {
      const user = await request(`/users/${encodeURIComponent(stored.id)}`);
      setCurrentUser(user);
      return user;
    }

    const suffix = Math.random().toString(36).slice(2, 8);
    const user = await request("/users", {
      method: "POST",
      body: JSON.stringify({
        loginName: `google_${suffix}`,
        password: `google-demo-${suffix}`,
        displayName: "Conta Google Demo",
      }),
    });
    writeJson(GOOGLE_KEY, { id: user.id, loginName: user.loginName });
    setCurrentUser(user);
    return user;
  }

  ensureSeedData();

  window.NCW = {
    request,
    money,
    imageForProduct,
    getCart,
    setCart,
    addToCart,
    removeFromCart,
    currentUserId,
    setCurrentUser,
    clearCurrentUser,
    applyPreferences,
    loadCurrentUser,
    signInWithGoogleDemo,
  };
})();
