const { Builder, By, until } = require("selenium-webdriver");
const { expect } = require("chai");
const config = require("./config");

describe("UI Player - Play Song", function () {
  this.timeout(120000);
  let driver;

  // ===== selectors =====
  const SEL = {
    email: By.css("#email"),
    password: By.css("#password"),
    loginBtn: By.xpath("//button[normalize-space()='LOGIN']"),

    playlistFirstSong: By.xpath(
      "//div[contains(@class,'playlist-grid')]//div[contains(@class,'music-card')][1]"
    ),

    playBtn: By.xpath(
      "//button[contains(@class,'playsong-btn') or contains(@class,'playSong-btn')]"
    ),

    seekBarAny: By.xpath(
      "//*[contains(@class,'progress-bar') or @data-testid='seek-bar']"
    ),
    seekBarInput: By.css("input.progress-bar"),

    volumeSlider: By.css("div.volume-control input.volume-bar"),

    lyricsContainer: By.css("div.lyrics-content"),
  };

  const sleep = (ms) => driver.sleep(ms);

  // ===== generic waits/clicks =====
  async function waitEl(locator, timeout = 10000) {
    const el = await driver.wait(until.elementLocated(locator), timeout);
    await driver.wait(until.elementIsVisible(el), timeout);
    return el;
  }

  async function safeClick(el, timeout = 10000) {
    await driver.executeScript(
      "arguments[0].scrollIntoView({block:'center', inline:'center'});",
      el
    );
    await driver.wait(until.elementIsVisible(el), timeout);
    await driver.wait(until.elementIsEnabled(el), timeout);

    try {
      await el.click();
    } catch (e) {
      try {
        await driver
          .actions({ bridge: true })
          .move({ origin: el })
          .click()
          .perform();
        return;
      } catch (_) {}
      await driver.executeScript("arguments[0].click();", el);
    }
  }

  // ===== login =====
  async function loginValidUser() {
    await driver.get(config.frontendUrl + "/login");
    await (await waitEl(SEL.email)).sendKeys("uyentu510@gmail.com");
    await driver.findElement(SEL.password).sendKeys("Abcd1234!");
    await driver.findElement(SEL.loginBtn).click();

    await driver.wait(until.urlContains("/home"), 10000);
    expect(await driver.getCurrentUrl()).to.include("/home");
  }

  // ===== song finding =====
  function escapeXPathText(text) {
    const s = String(text);
    if (!s.includes("'")) return `'${s}'`;
    const parts = s.split("'").map((p) => `'${p}'`);
    return `concat(${parts.join(`, "'", `)})`;
  }

  async function findSongByName(name) {
    const safe = escapeXPathText(name);
    const songXpath = `//div[contains(@class,'music-card')][.//*[contains(normalize-space(.), ${safe})]]`;
    return driver.wait(until.elementLocated(By.xpath(songXpath)), 10000);
  }

  async function openSongByName(name) {
    const card = await findSongByName(name);
    await safeClick(card);
  }

  async function openFirstSongInPlaylist() {
    const firstSong = await waitEl(SEL.playlistFirstSong, 10000);
    await safeClick(firstSong);
  }

  // ===== player/lyrics helpers =====
  async function getPlayIconClass(playBtnEl) {
    return playBtnEl
      .findElement(By.css("svg"))
      .then((e) => e.getAttribute("class"));
  }

  async function getAudioState() {
    return driver.executeScript(`
      const audio = document.querySelector('audio');
      if (!audio) return null;
      return {
        paused: audio.paused,
        currentTime: audio.currentTime,
        readyState: audio.readyState,
        src: audio.currentSrc || audio.src || null,
        volume: audio.volume
      };
    `);
  }

  async function waitAudioPlaying(timeout = 12000) {
    await driver.wait(
      async () => {
        const st = await getAudioState();
        return st && st.paused === false;
      },
      timeout,
      "Audio did not start playing"
    );
  }

  async function waitAudioTimeGreaterThan(sec, timeout = 20000) {
    await driver.wait(
      async () => {
        const st = await getAudioState();
        return st && st.currentTime > sec;
      },
      timeout,
      `Audio currentTime did not exceed ${sec}s`
    );
  }

  async function waitSeekBarMaxLoaded(timeout = 10000) {
    const sb = await waitEl(SEL.seekBarInput, timeout);
    await driver.wait(
      async () => {
        const maxVal = Number(await sb.getAttribute("max"));
        return maxVal > 0;
      },
      timeout,
      "Seekbar max not loaded"
    );
    return sb;
  }

  async function getActiveLyricInfo() {
    return driver.executeScript(`
      const container = document.querySelector('div.lyrics-content');
      if (!container) return { allCount: 0, contentCount: 0, contentText: null };

      const els = Array.from(container.querySelectorAll('.active-line'));
      const texts = els.map(e => (e.textContent || '').trim());
      const contentTexts = texts.filter(t => t && !t.startsWith('['));

      return {
        allCount: texts.length,
        contentCount: contentTexts.length,
        contentText: contentTexts[0] || null
      };
    `);
  }

  async function getActiveContentLyricText() {
    return driver.executeScript(`
      const container = document.querySelector('div.lyrics-content');
      if (!container) return null;

      const els = Array.from(container.querySelectorAll('.active-line'));
      const texts = els.map(e => (e.textContent || '').trim());
      const contentTexts = texts.filter(t => t && !t.startsWith('['));

      return contentTexts[0] || null;
    `);
  }

  // Drag/click seekbar to second (option useDrag for playing case)
  async function dragSeekBarToSecond(
    seekBar,
    targetSec,
    { useDrag = false } = {}
  ) {
    await driver.executeScript(
      "arguments[0].scrollIntoView({block:'center', inline:'center'});",
      seekBar
    );

    const max = Number(await seekBar.getAttribute("max"));
    if (!max || max <= 0) throw new Error("Seekbar max invalid");

    const t = Math.max(0, Math.min(targetSec, max));
    const rect = await seekBar.getRect();
    const ratio = t / max;
    const xFromCenter = Math.round(-rect.width / 2 + rect.width * ratio);

    const actions = driver
      .actions({ bridge: true })
      .move({ origin: seekBar, x: xFromCenter, y: 0 });

    if (useDrag) {
      await driver
        .actions({ bridge: true })
        .move({ origin: seekBar, x: 0, y: 0 })
        .press()
        .move({ origin: seekBar, x: xFromCenter, y: 0 })
        .release()
        .perform();
    } else {
      await actions.click().perform();
    }

    await driver.executeScript(
      `
        const el = arguments[0];
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      `,
      seekBar
    );
  }

  async function setRangeInputValue(inputEl, value) {
    await driver.executeScript(
      `
        const el = arguments[0];
        const val = arguments[1];
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      `,
      inputEl,
      value
    );
  }

  // ===== setup =====
  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async () => {
    await driver.quit();
  });

  // ===================== TESTS =====================

  it("Play song - tc03", async () => {
    await loginValidUser();
    openSongByName("Bubbly");

    const playBtn = await waitEl(SEL.playBtn);

    const beforeIconClass = await getPlayIconClass(playBtn);
    expect(beforeIconClass).to.include("lucide-play");

    await safeClick(playBtn);
    await sleep(1500);

    const afterIconClass = await getPlayIconClass(playBtn);
    expect(afterIconClass).to.include("lucide-pause");

    const seekBar = await driver.findElement(SEL.seekBarAny);
    const v1 = await seekBar.getAttribute("value");
    await sleep(2000);
    const v2 = await seekBar.getAttribute("value");

    expect(v2).to.not.equal(v1);
  });

  it("Play and pause song - tc04", async () => {
    await loginValidUser();
    openSongByName("Bubbly");

    const playBtn = await waitEl(SEL.playBtn);

    const beforeIconClass = await getPlayIconClass(playBtn);
    expect(beforeIconClass).to.include("lucide-play");

    await safeClick(playBtn);
    await sleep(1500);

    const afterIconClass = await getPlayIconClass(playBtn);
    expect(afterIconClass).to.include("lucide-pause");

    const seekBar = await driver.findElement(SEL.seekBarAny);
    const v1 = await seekBar.getAttribute("value");
    await sleep(2000);
    const v2 = await seekBar.getAttribute("value");
    expect(v2).to.not.equal(v1);

    // Pause
    await safeClick(playBtn);
    await sleep(1500);

    const pauseIconClass = await getPlayIconClass(playBtn);
    expect(pauseIconClass).to.include("lucide-play");

    const p1 = await seekBar.getAttribute("value");
    await sleep(2000);
    const p2 = await seekBar.getAttribute("value");

    expect(p2).to.equal(p1);
    expect(Number(p1)).to.be.greaterThan(0);
  });

  it("Drag seek bar - tc05", async () => {
    await loginValidUser();
    await openFirstSongInPlaylist();

    const playBtn = await waitEl(SEL.playBtn);
    const iconBefore = await getPlayIconClass(playBtn);
    expect(iconBefore).to.include("lucide-play");

    const seekBar = await waitSeekBarMaxLoaded();
    const v0 = Number(await seekBar.getAttribute("value"));
    const max = Number(await seekBar.getAttribute("max"));
    const newValue = Math.max(1, Math.floor(max * 0.5));

    // Drag while NOT playing: set by JS
    await setRangeInputValue(seekBar, newValue);
    await sleep(800);

    const v1 = Number(await seekBar.getAttribute("value"));
    expect(v1).to.not.equal(v0);

    // Still not playing
    const iconAfter = await getPlayIconClass(playBtn);
    expect(iconAfter).to.include("lucide-play");
    expect(iconAfter).to.not.include("lucide-pause");

    // Seekbar stays
    const v2 = Number(await seekBar.getAttribute("value"));
    await sleep(1500);
    const v3 = Number(await seekBar.getAttribute("value"));
    expect(v3).to.equal(v2);
    expect(v3).to.equal(v1);
  });

  it("Drag seek bar while playing - tc06", async () => {
    await loginValidUser();
    await openFirstSongInPlaylist();

    const playBtn = await waitEl(SEL.playBtn);
    const seekBar = await waitSeekBarMaxLoaded();

    // Play
    await safeClick(playBtn);
    await waitAudioPlaying(12000);
    await sleep(800);

    const iconPlaying = await getPlayIconClass(playBtn);
    expect(iconPlaying).to.include("lucide-pause");

    // Confirm seekbar running
    const v1 = Number(await seekBar.getAttribute("value"));
    await sleep(1500);
    const v2 = Number(await seekBar.getAttribute("value"));
    expect(v2).to.be.greaterThan(v1);

    const max = Number(await seekBar.getAttribute("max"));
    const targetValue = Math.floor(max * 0.5);

    // Drag while playing (useDrag = true)
    await dragSeekBarToSecond(seekBar, targetValue, { useDrag: true });
    await sleep(800);

    // Verify jumped near target
    const afterDrag = Number(await seekBar.getAttribute("value"));
    expect(afterDrag).to.be.closeTo(targetValue, 10);

    // Still playing
    const iconStillPlaying = await getPlayIconClass(playBtn);
    expect(iconStillPlaying).to.include("lucide-pause");

    // Continues from new position
    const v3 = Number(await seekBar.getAttribute("value"));
    await sleep(2000);
    const v4 = Number(await seekBar.getAttribute("value"));
    expect(v4).to.be.greaterThan(v3);
    expect(v4).to.be.greaterThan(targetValue - 10);
  });

  it("Adjust volume slider - tc07", async () => {
    await loginValidUser();
    await openFirstSongInPlaylist();

    const playBtn = await waitEl(SEL.playBtn);
    await safeClick(playBtn);
    await waitAudioPlaying(12000);
    await sleep(800);

    const volumeSlider = await waitEl(SEL.volumeSlider);

    // 1) volume 30
    await setRangeInputValue(volumeSlider, 30);
    await sleep(300);
    let st = await getAudioState();
    expect(Number(await volumeSlider.getAttribute("value"))).to.equal(30);
    expect(st.volume).to.be.closeTo(0.3, 0.02);
    expect(await getPlayIconClass(playBtn)).to.include("lucide-pause");

    // 2) volume 90
    await setRangeInputValue(volumeSlider, 90);
    await sleep(300);
    st = await getAudioState();
    expect(Number(await volumeSlider.getAttribute("value"))).to.equal(90);
    expect(st.volume).to.be.closeTo(0.9, 0.02);
    expect(await getPlayIconClass(playBtn)).to.include("lucide-pause");

    // 3) volume 20
    await setRangeInputValue(volumeSlider, 20);
    await sleep(300);
    st = await getAudioState();
    expect(Number(await volumeSlider.getAttribute("value"))).to.equal(20);
    expect(st.volume).to.be.closeTo(0.2, 0.02);
    expect(await getPlayIconClass(playBtn)).to.include("lucide-pause");
  });

it("No lyrics - tc08", async () => {
  await loginValidUser();

  // Chọn 1 bài chắc chắn không có lyrics (bài test data)
  await openSongByName("Bubbly version no lyric");

  // Mở lyrics area (nếu lyrics chỉ hiện sau khi play thì cứ bấm play)
  const playBtn = await waitEl(SEL.playBtn);
  await safeClick(playBtn);

  const container = await waitEl(SEL.lyricsContainer);

  // Đợi UI render thông báo không có lyrics
  await driver.wait(async () => {
    const text = (await container.getText())?.trim();
    return text && text.includes("Lyrics are not available");
  }, 10000, "Lyrics fallback text not shown");

  const shown = (await container.getText()).trim();
  expect(shown).to.include("Lyrics are not available");
});

  it("LRC lyrics sync while playing from start - tc10", async () => {
    await loginValidUser();
    await openSongByName("Bubbly");

    const playBtn = await waitEl(SEL.playBtn);
    await waitEl(SEL.lyricsContainer);

    // Start playing
    await safeClick(playBtn);
    await waitAudioPlaying(12000);

    // Wait lyric content appears
    await driver.wait(async () => {
      const t = await getActiveContentLyricText();
      return t !== null;
    }, 10000, "No active content lyric line found");

    const text1 = await getActiveContentLyricText();
    expect(text1).to.not.equal(null);

    // Wait lyric changes (stop checking within 10s)
    await driver.wait(async () => {
      const t = await getActiveContentLyricText();
      return t && t !== text1;
    }, 10000, "Active lyric did not change");

    const text2 = await getActiveContentLyricText();
    const st = await getAudioState();

    expect(st.paused).to.equal(false);
    expect(text2).to.not.equal(text1);
  });

  it("Bubbly lyric line is correct when pausing at 13s - tc11", async () => {
    await loginValidUser();
    await openSongByName("Bubbly");

    const playBtn = await waitEl(SEL.playBtn);
    await waitEl(SEL.lyricsContainer);

    // Play
    await safeClick(playBtn);
    await waitAudioPlaying(12000);

    // Wait until >= 13s
    await driver.wait(async () => {
      const st = await getAudioState();
      return st && st.currentTime >= 13;
    }, 25000, "Audio did not reach 13s in time");

    // Pause
    await safeClick(playBtn);
    await sleep(800);

    const stPaused = await getAudioState();
    expect(stPaused.paused).to.equal(true);

    const activeAt13 = await getActiveLyricInfo();
    expect(activeAt13.contentCount).to.equal(1);
    expect(activeAt13.contentText).to.not.equal(null);

    // hard-check expected line around 13s (your current expectation)
    expect(activeAt13.contentText.toLowerCase()).to.include("and i can scarce get by");
  });

  it("Bubbly lyrics highlight correctly when seeking to 1:00 - tc12", async () => {
    await loginValidUser();
    await openSongByName("Bubbly");

    const playBtn = await waitEl(SEL.playBtn);
    await waitEl(SEL.lyricsContainer);

    // Play
    await safeClick(playBtn);
    await waitAudioPlaying(12000);
    await waitAudioTimeGreaterThan(5, 20000);

    const seekBar = await waitSeekBarMaxLoaded();
    const max = Number(await seekBar.getAttribute("max"));
    const targetSec = Math.min(max - 1, 60);

    const beforeSeekLyric = await getActiveLyricInfo();

    // Drag to ~1:00
    await dragSeekBarToSecond(seekBar, targetSec, { useDrag: true });
    await sleep(800);

    // Wait audio near 60s (±5s)
    await driver.wait(async () => {
      const st = await getAudioState();
      return st && Math.abs(st.currentTime - targetSec) <= 5;
    }, 15000, "Audio did not jump near 60s after dragging");

    // ✅ Behavior assert: lyric should update after seek
    await driver.wait(async () => {
      const after = await getActiveLyricInfo();
      return (
        after.contentCount === 1 &&
        after.contentText &&
        after.contentText !== beforeSeekLyric.contentText
      );
    }, 10000, "Lyric did not update after seek");

    const afterSeekLyric = await getActiveLyricInfo();
    expect(afterSeekLyric.contentCount).to.equal(1);
    expect(afterSeekLyric.contentText).to.not.equal(null);

    expect(afterSeekLyric.contentText.toLowerCase()).to.include("a glacial pace");
  });
  async function getPlayBtn() {
    return driver.wait(until.elementLocated(SEL.playBtn), 10000);
  }

  async function getIconClassFromPlayBtn() {
    const btn = await getPlayBtn();
    const svg = await btn.findElement(By.css("svg"));
    return svg.getAttribute("class");
  }

  async function waitAudioPlayingAndProgress(timeout = 12000) {
    await driver.wait(
      async () => {
        const st = await getAudioState();
        if (!st || st.paused !== false) return false;
        // currentTime phải > 0 một chút
        return st.currentTime > 0.2;
      },
      timeout,
      "Audio did not start playing"
    );
  }

  it("Playback ends and player updates correctly - tc13", async () => {
    await loginValidUser();

    await openSongByName("Bubbly");
    await waitEl(SEL.seekBarInput, 10000);

    const iconBefore = await getIconClassFromPlayBtn();
    expect(iconBefore).to.include("lucide-play");

    let playBtn = await getPlayBtn();
    await safeClick(playBtn);

    try {
      await waitAudioPlayingAndProgress(8000);
    } catch (e) {
      playBtn = await getPlayBtn();
      await safeClick(playBtn);
      await waitAudioPlayingAndProgress(12000);
    }

    const iconAfterPlay = await getIconClassFromPlayBtn();
    expect(iconAfterPlay).to.include("lucide-pause");

    // seekbar moves
    const seekBar = await driver.findElement(SEL.seekBarInput);
    await driver.wait(
      async () => Number(await seekBar.getAttribute("max")) > 0,
      10000
    );

    const v1 = Number(await seekBar.getAttribute("value"));
    await driver.sleep(1200);
    const v2 = Number(await seekBar.getAttribute("value"));
    expect(v2).to.be.greaterThan(v1);

    // Step 3: jump near end then wait end
    const dur = await driver.executeScript(`
    const a = document.querySelector('audio');
    return a ? a.duration : null;
  `);
    expect(dur).to.not.equal(null);

    await driver.executeScript(`
    const a = document.querySelector('audio');
    if (a) a.currentTime = Math.max(0, a.duration - 1.0);
  `);

    await driver.wait(
      async () => {
        const st = await driver.executeScript(`
      const a = document.querySelector('audio');
      if (!a) return null;
      return { ended: a.ended, paused: a.paused, currentTime: a.currentTime, duration: a.duration };
    `);
        return (
          st &&
          (st.ended === true ||
            (st.paused === true && st.currentTime >= st.duration - 0.2))
        );
      },
      20000,
      "Audio did not end in time"
    );

    const iconAfterEnd = await getIconClassFromPlayBtn();
    expect(iconAfterEnd).to.include("lucide-play");
  });
});
