const { Builder, By, until } = require("selenium-webdriver");
const { expect } = require("chai");
const config = require("./config");

describe("UI - Search Music", function () {
  this.timeout(30000);
  let driver;

  // ===== Selectors =====
  const SEL = {
    // login
    email: By.css("#email"),
    password: By.css("#password"),
    loginBtn: By.xpath("//button[normalize-space()='LOGIN']"),

    // search
    searchInput: By.css(".profile-search-input"),
    resultsContainer: By.css(".profile-search-horizontal"),
    resultCards: By.css(".profile-search-horizontal .music-card"),

    // inside a card
    titleInCard: By.css(".music-title"),
    artistInCard: By.css(".music-artist"),
  };

  // ===== Helpers =====
  const normalize = (s) =>
    String(s ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const escRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  async function waitEl(locator, timeout = 10000) {
    await driver.wait(until.elementLocated(locator), timeout);
    const el = await driver.findElement(locator);
    await driver.wait(until.elementIsVisible(el), timeout);
    return el;
  }

  async function safeClick(elOrLocator) {
    const el = elOrLocator?.findElement
      ? elOrLocator
      : await waitEl(elOrLocator);
    await driver.wait(until.elementIsVisible(el), 8000);
    await driver.wait(until.elementIsEnabled(el), 8000);
    await el.click();
    return el;
  }

  async function sendKeysSafe(el, ...parts) {
    const safe = parts.map((p) =>
      p === undefined || p === null ? "" : String(p)
    );
    return el.sendKeys(...safe);
  }

  async function gotoHome() {
    await driver.get(config.frontendUrl);
    // đảm bảo search input có mặt
    await waitEl(SEL.searchInput);
  }

  async function loginValidUser() {
    await driver.get(config.frontendUrl + "/login");

    const emailEl = await waitEl(SEL.email);
    await emailEl.clear();
    await sendKeysSafe(emailEl, "uyentu510@gmail.com");

    const passEl = await waitEl(SEL.password);
    await passEl.clear();
    await sendKeysSafe(passEl, "Abcd1234!");

    await safeClick(SEL.loginBtn);

    await driver.wait(until.urlContains("/home"), 10000);
    expect(await driver.getCurrentUrl()).to.include("/home");
  }

  async function focusSearchInput() {
    const input = await waitEl(SEL.searchInput);
    await safeClick(input);

    const active = await driver.switchTo().activeElement();
    const activeCls = (await active.getAttribute("class")) || "";
    expect(activeCls).to.include("profile-search-input");

    return input;
  }

  async function waitSearchingCycle() {
    // UI bạn: gõ xong => có thể hiện "Searching" 1 lúc rồi biến mất.
    // 1) thử đợi nó xuất hiện (không bắt buộc)
    await driver
      .wait(
        until.elementLocated(
          By.xpath("//*[contains(normalize-space(.), 'Searching')]")
        ),
        2000
      )
      .catch(() => {});

    // 2) đợi nó biến mất (nếu có)
    await driver.wait(
      async () => {
        const els = await driver.findElements(
          By.xpath("//*[contains(normalize-space(.), 'Searching')]")
        );
        return els.length === 0;
      },
      10000,
      "Searching did not disappear"
    );
  }

  async function waitResultsLoaded(min = 1) {
    await driver.wait(
      async () => {
        const cards = await driver.findElements(SEL.resultCards);
        return cards.length >= min;
      },
      10000,
      "Results did not load"
    );
  }

  async function getResultCards() {
    return driver.findElements(SEL.resultCards);
  }

  async function getCardTitleArtist(card) {
    // ưu tiên lấy title + artist riêng (ổn định hơn text toàn card)
    const titleEls = await card.findElements(SEL.titleInCard);
    const artistEls = await card.findElements(SEL.artistInCard);

    const title = titleEls.length ? normalize(await titleEls[0].getText()) : "";
    const artist = artistEls.length
      ? normalize(await artistEls[0].getText())
      : "";

    // fallback: lấy text của cả card
    if (!title && !artist) return normalize(await card.getText());

    return normalize(`${title} ${artist}`);
  }

  // ===== Core action: search keyword (auto-search, không Enter/click) =====
  async function performSearch(keyword) {
    await gotoHome();

    const input = await focusSearchInput();
    await input.clear();
    await sendKeysSafe(input, keyword);

    await waitSearchingCycle();
    await waitResultsLoaded(1);

    return getResultCards();
  }

  // ===== Assertions =====
  async function assertExpectedSongAppears(expectedSong) {
    await driver.wait(
      until.elementLocated(
        By.xpath(
          `//*[contains(normalize-space(.), ${JSON.stringify(expectedSong)})]`
        )
      ),
      10000,
      `Expected song '${expectedSong}' did not appear`
    );
  }

  async function assertAllResultsContainKeyword(cards, keyword) {
    const kw = normalize(keyword);
    const re = new RegExp(escRegex(kw), "i");

    let checked = 0;
    for (const card of cards) {
      const hay = await getCardTitleArtist(card);
      if (!hay) continue;

      expect(hay).to.match(re);
      checked += 1;
    }
    expect(checked).to.be.greaterThan(0);
  }

  async function assertExactMatchSongName(cards, expectedSongName) {
    const expected = normalize(expectedSongName);

    let checked = 0;
    for (const card of cards) {
      // exact match theo "title" nếu có
      const titleEls = await card.findElements(SEL.titleInCard);
      if (titleEls.length) {
        const title = normalize(await titleEls[0].getText());
        expect(title).to.equal(expected);
        checked += 1;
        continue;
      }

      // fallback: nếu không có title element thì kiểm tra text cả card
      const hay = normalize(await card.getText());
      expect(hay).to.include(expected);
      checked += 1;
    }
    expect(checked).to.be.greaterThan(0);
  }

  // ===== Setup/Teardown =====
  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
    await loginValidUser();
  });

  after(async () => {
    await driver.quit();
  });

  // =========================================================
  // =============== Rewrite ALL your test cases ===============
  // =========================================================

  // tc01: keyword = full song name (exact)
  it("TC01 - Search exact '3 Night' returns exact matched song name", async () => {
    const keyword = "3 Night";
    const expectedSong = "3 Night";

    const cards = await performSearch(keyword);
    await assertExpectedSongAppears(expectedSong);

    // exact match (title == expected)
    await assertExactMatchSongName(cards, expectedSong);
  });

  // tc02: keyword partial
  it("TC02 - Search partial '3' shows '3 Night' and all results contain keyword", async () => {
    const keyword = "3";
    const expectedSong = "3 Night";

    const cards = await performSearch(keyword);
    await assertExpectedSongAppears(expectedSong);

    // all results contain keyword in title/artist (partial match)
    await assertAllResultsContainKeyword(cards, keyword);
  });

  // tc03: keyword partial prefix
  it("TC03 - Search partial '3 N' shows '3 Night' and all results contain keyword", async () => {
    const keyword = "3 N";
    const expectedSong = "3 Night";

    const cards = await performSearch(keyword);
    await assertExpectedSongAppears(expectedSong);

    await assertAllResultsContainKeyword(cards, keyword);
  });

  // tc04: keyword g (bạn từng hardcode check '3' nên fail)
  it("TC04 - Search keyword 'g' loads results and all results contain keyword", async () => {
    const keyword = "g";

    const cards = await performSearch(keyword);

    // chỉ cần có list
    expect(cards.length).to.be.greaterThan(0);

    // tất cả kết quả phải contain keyword "g" (title/artist)
    await assertAllResultsContainKeyword(cards, keyword);
  });

  // =========================================================
  // ========== Extra tests you asked before (optional) ========
  // =========================================================

  it("TC05 - suffix 'ght' should behave like '3 Night'", async () => {
    const keyword = "ght";
    const expectedSong = "3 Night";

    const cards = await performSearch(keyword);
    await assertExpectedSongAppears(expectedSong);
    // tùy spec bạn muốn exact hay contains:
    await assertAllResultsContainKeyword(cards, "ght");
  });

  it("TC06 - Case-insensitive 'night' should behave like '3 Night'", async () => {
    const keyword = "night";
    const expectedSong = "3 Night";

    const cards = await performSearch(keyword);
    await assertExpectedSongAppears(expectedSong);
    // tùy spec bạn muốn exact hay contains:
    await assertAllResultsContainKeyword(cards, "night");
  });

  it("TC07 - Trim spaces: '   3 night   ' returns correct results", async () => {
    const keyword = "   3 night   ";
    const expectedSong = "3 Night";

    const cards = await performSearch(keyword);
    await assertExpectedSongAppears(expectedSong);
    await assertAllResultsContainKeyword(cards, "3 night");
  });

  it("TC09 - Special cases: 'Don't' returns correct results", async () => {
    const keyword = "Don't";
    const expectedSong = "Don't worry";

    const cards = await performSearch(keyword);
    await assertExpectedSongAppears(expectedSong);
    await assertAllResultsContainKeyword(cards, "Don't");
  });

  it("TC10 - No match: show empty results or empty-state message", async () => {
    const keyword = "xy12";

    await gotoHome();
    const input = await focusSearchInput();
    await input.clear();
    await sendKeysSafe(input, keyword);

    await waitSearchingCycle();

    // tuỳ UI: có thể show empty message, hoặc list rỗng
    const cards = await driver.findElements(SEL.resultCards);
    if (cards.length > 0) {
      // nếu UI vẫn trả list (không đúng kỳ vọng) thì fail để bạn phát hiện
      expect(cards.length).to.equal(0);
    } else {
      // list rỗng OK
      expect(cards.length).to.equal(0);
    }
  });
  it("TC11 - Click '3 Night' result navigates to Song Detail screen", async () => {
    const keyword = "3 Night";
    const targetSong = "3 Night";

    // Search (auto-search)
    const cards = await performSearch(keyword);
    await assertExpectedSongAppears(targetSong);

    // Find the card that has title "3 Night" and click it
    let targetCard = null;
    for (const card of cards) {
      const titleEls = await card.findElements(SEL.titleInCard);
      const title = titleEls.length
        ? ((await titleEls[0].getText()) || "").trim()
        : "";
      if (title === targetSong) {
        targetCard = card;
        break;
      }
    }
    expect(
      targetCard,
      `Cannot find result card with title '${targetSong}'`
    ).to.not.equal(null);

    await safeClick(targetCard);

    // ===== Assert navigation =====
    // Option A: URL contains "/song" or "/songs" (đổi theo route thật của bạn)
    await driver.wait(
      async () => {
        const url = await driver.getCurrentUrl();
        return /\/song|\/songs|\/detail/i.test(url);
      },
      10000,
      "Did not navigate to a song detail URL"
    );

    // Option B: Song detail page displays title = "3 Night"
    // ⚠️ đổi selector này theo UI detail của bạn (ví dụ: ".song-detail-title" hoặc "h1")
    const detailTitleEl = await driver.wait(
      until.elementLocated(By.css(".songplayer-title")),
      10000,
      "Song detail title element not found"
    );

    const detailTitle = ((await detailTitleEl.getText()) || "").trim();
    expect(detailTitle).to.include(targetSong);
  });

  it("TC12 - Unikey 'trô' returns correct results", async () => {
    const keyword = "trô";
    const expectedSong = "Lạc trôi mới nhất 2025 !!";

    const cards = await performSearch(keyword);
    await assertExpectedSongAppears(expectedSong);
    await assertAllResultsContainKeyword(cards, "trô");
  });
});
