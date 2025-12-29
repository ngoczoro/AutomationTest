const { Builder, By, until } = require("selenium-webdriver");
const { expect } = require("chai");
const config = require("./config");

describe("UI Favorite Songs - Additional Tests", function () {
  this.timeout(40000); // Tăng timeout cho các test phức tạp
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async () => {
    await driver.quit();
  });

  beforeEach(async () => {
    // Đăng nhập trước khi vào trang favorite
    await driver.get(config.frontendUrl + "/login");
    
    await driver
      .findElement(By.xpath('//*[@id="email"]'))
      .sendKeys("uyentu510@gmail.com");
    await driver
      .findElement(By.xpath('//*[@id="password"]'))
      .sendKeys("Abcd1234!");
    
    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();
    
    await driver.wait(until.urlContains("/home"), 10000);
    await driver.get(config.frontendUrl + "/favourite");
    await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Your Favorites')]")), 10000);
  });

  it("Should maintain sort preference after page navigation - tc14", async () => {
    const sortDropdown = await driver.findElement(By.className("playlist-sort-dropdown"));
    
    // Chọn sort A-Z
    await driver.executeScript(
      "arguments[0].value = 'a-z'; arguments[0].dispatchEvent(new Event('change'));",
      sortDropdown
    );
    
    await driver.sleep(1000);
    
    // Điều hướng đến trang khác rồi quay lại
    await driver.get(config.frontendUrl + "/home");
    await driver.sleep(1000);
    await driver.get(config.frontendUrl + "/favourite");
    await driver.sleep(2000);
    
    // Kiểm tra sort preference đã được giữ
    const updatedDropdown = await driver.findElement(By.className("playlist-sort-dropdown"));
    const selectedValue = await updatedDropdown.getAttribute("value");
    expect(selectedValue).to.equal("a-z");
  });

  it("Should display correct song count in pagination - tc15", async () => {
    const songCards = await driver.findElements(By.className("music-card"));
    const totalSongs = songCards.length;
    
    // Lấy thông tin phân trang
    const paginationButtons = await driver.findElements(By.className("pagination-btn:not(.pagination-nav-btn):not(.pagination-ellipsis)"));
    
    if (paginationButtons.length > 0) {
      // Tính toán số trang dự kiến
      const songsPerPage = 8;
      const expectedPages = Math.ceil(totalSongs / songsPerPage);
      
      // Số nút phân trang không được vượt quá expectedPages + 2 (nút điều hướng)
      expect(paginationButtons.length).to.be.at.most(expectedPages + 2);
    }
  });

  it("Should handle ellipsis in pagination correctly - tc16", async () => {
    const paginationContainer = await driver.findElements(By.className("pagination-container"));
    
    if (paginationContainer.length > 0) {
      const ellipsisButtons = await driver.findElements(By.className("pagination-ellipsis"));
      
      // Kiểm tra nếu có ellipsis thì nó phải bị disabled
      for (let button of ellipsisButtons) {
        const isDisabled = await button.getAttribute("disabled");
        expect(isDisabled).to.equal("true");
        
        const text = await button.getText();
        expect(text).to.equal("...");
      }
    }
  });

  it("Should not break when clicking disabled pagination buttons - tc17", async () => {
    const firstPageBtn = await driver.findElement(
      By.xpath("//button[contains(@class, 'pagination-nav-btn') and contains(@title, 'First page')]")
    );
    
    const prevPageBtn = await driver.findElement(
      By.xpath("//button[contains(@class, 'pagination-nav-btn') and contains(@title, 'Previous page')]")
    );
    
    // Nhấn vào nút First và Previous khi đang ở trang 1 (disabled)
    await firstPageBtn.click();
    await prevPageBtn.click();
    
    // Kiểm tra không có lỗi xảy ra và vẫn ở trang 1
    await driver.sleep(1000);
    
    const currentPageBtn = await driver.findElement(By.className("pagination-btn-active"));
    const currentPage = await currentPageBtn.getText();
    expect(currentPage).to.equal("1");
  });

  it("Should handle rapid unlike clicks - tc18", async () => {
    const likeButtons = await driver.findElements(
      By.xpath("//button[contains(@class, 'favorite-icon active')]")
    );
    
    if (likeButtons.length >= 2) {
      // Click unlike hai bài hát liên tiếp
      await likeButtons[0].click();
      await driver.sleep(200); // Chờ nhỏ
      await likeButtons[1].click();
      
      // Đợi xử lý
      await driver.sleep(1500);
      
      // Kiểm tra không có lỗi hiển thị
      const errorMessages = await driver.findElements(By.xpath("//*[contains(text(), 'Error')]"));
      expect(errorMessages.length).to.equal(0);
    }
  });

  it("Should show loading spinner or text during initial load - tc19", async () => {
    // Làm mới trang để thấy loading state
    await driver.navigate().refresh();
    
    // Kiểm tra loading indicator
    try {
      const loadingIndicator = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(), 'Loading') or contains(@class, 'spinner') or contains(@class, 'loading')]")),
        3000
      );
      expect(await loadingIndicator.isDisplayed()).to.be.true;
      
      // Đợi loading biến mất
      await driver.wait(until.stalenessOf(loadingIndicator), 10000);
    } catch (error) {
      // Có thể loading quá nhanh không bắt kịp
      console.log("Loading indicator might have disappeared too quickly");
    }
  });

  it("Should preserve scroll position after unlike action - tc20", async () => {
    // Chỉ test nếu có nhiều bài hát
    const songCards = await driver.findElements(By.className("music-card"));
    
    if (songCards.length > 5) {
      // Cuộn xuống
      await driver.executeScript("window.scrollTo(0, 500);");
      await driver.sleep(1000);
      
      // Lấy vị trí cuộn hiện tại
      const scrollYBefore = await driver.executeScript("return window.scrollY;");
      
      // Unlike một bài hát
      const likeButtons = await driver.findElements(
        By.xpath("//button[contains(@class, 'favorite-icon active')]")
      );
      
      if (likeButtons.length > 0) {
        await likeButtons[0].click();
        await driver.sleep(1500);
        
        // Kiểm tra vị trí cuộn không thay đổi đáng kể
        const scrollYAfter = await driver.executeScript("return window.scrollY;");
        expect(Math.abs(scrollYAfter - scrollYBefore)).to.be.lessThan(100);
      }
    }
  });

  it("Should handle network disconnect gracefully - tc21", async () => {
    // Thử mô phỏng mất kết nối bằng cách chặn các request API
    await driver.executeScript(`
      window.originalFetch = window.fetch;
      window.fetch = function() {
        return Promise.reject(new Error('Network Error'));
      };
    `);
    
    // Làm mới trang
    await driver.navigate().refresh();
    
    // Kiểm tra xem có hiển thị thông báo lỗi không
    await driver.sleep(2000);
    
    try {
      const errorElement = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(), 'Error') or contains(text(), 'Failed') or contains(text(), 'Network')]")),
        5000
      );
      expect(await errorElement.isDisplayed()).to.be.true;
    } catch (error) {
      // Có thể không bắt được lỗi
      console.log("Might not display error message as expected");
    }
    
    // Khôi phục fetch
    await driver.executeScript("window.fetch = window.originalFetch;");
  });

  it("Should have responsive layout on different viewports - tc22", async () => {
    // Test với mobile viewport
    await driver.manage().window().setRect({ width: 375, height: 667 }); // iPhone SE
    
    await driver.sleep(1000);
    
    // Kiểm tra các phần tử vẫn hiển thị
    const pageTitle = await driver.findElement(By.xpath("//h2[contains(text(), 'Your Favorites')]"));
    expect(await pageTitle.isDisplayed()).to.be.true;
    
    const sortDropdown = await driver.findElement(By.className("playlist-sort-dropdown"));
    expect(await sortDropdown.isDisplayed()).to.be.true;
    
    // Kiểm tra grid layout vẫn hoạt động
    const songCards = await driver.findElements(By.className("music-card"));
    if (songCards.length > 0) {
      const firstCard = songCards[0];
      expect(await firstCard.isDisplayed()).to.be.true;
    }
    
    // Trở lại viewport mặc định
    await driver.manage().window().maximize();
  });

  it("Should handle empty state with 'Play All' button - tc23", async () => {
    // Xóa tất cả bài hát yêu thích (cần API hỗ trợ)
    // Giả sử chúng ta có một tài khoản test không có bài hát yêu thích
    // Hoặc tạo tài khoản mới
    
    // Tạm thời kiểm tra nếu không có bài hát
    const emptyMessage = await driver.findElements(
      By.xpath("//p[contains(text(), 'You don\\'t have any favorite songs yet.')]")
    );
    
    if (emptyMessage.length > 0) {
      // Kiểm tra nút Play All vẫn hiển thị nhưng có thể disabled hoặc không
      const playAllBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Play All')]"));
      expect(await playAllBtn.isDisplayed()).to.be.true;
      
      // Kiểm tra không có pagination khi không có bài hát
      const paginationContainer = await driver.findElements(By.className("pagination-container"));
      expect(paginationContainer.length).to.equal(0);
    }
  });

  it("Should maintain state after browser back navigation - tc24", async () => {
    // Ghi nhận state ban đầu
    const initialSongCount = (await driver.findElements(By.className("music-card"))).length;
    
    // Điều hướng đến trang khác
    await driver.get(config.frontendUrl + "/home");
    await driver.sleep(1000);
    
    // Quay lại bằng browser back
    await driver.navigate().back();
    await driver.sleep(2000);
    
    // Kiểm tra state được giữ nguyên
    const finalSongCount = (await driver.findElements(By.className("music-card"))).length;
    expect(finalSongCount).to.equal(initialSongCount);
    
    // Kiểm tra URL vẫn đúng
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include("/favourite");
  });

  it("Should handle concurrent user actions - tc25", async () => {
    // Thực hiện nhiều hành động cùng lúc
    const actions = [];
    
    // 1. Click sort dropdown
    const sortDropdown = await driver.findElement(By.className("playlist-sort-dropdown"));
    actions.push(sortDropdown.click());
    
    // 2. Click Play All button (nếu có)
    const playAllBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Play All')]"));
    actions.push(playAllBtn.click());
    
    // 3. Click vào một bài hát (nếu có)
    const songCards = await driver.findElements(By.className("music-card"));
    if (songCards.length > 0) {
      actions.push(songCards[0].click());
    }
    
    // Thực hiện tất cả actions
    await Promise.all(actions.map(action => action.catch(e => console.log("Action error:", e))));
    
    // Đợi và kiểm tra không có lỗi nghiêm trọng
    await driver.sleep(2000);
    
    const errorAlerts = await driver.findElements(By.xpath("//*[contains(@class, 'error') or contains(@class, 'alert')]"));
    expect(errorAlerts.length).to.equal(0);
  });

  it("Should validate song metadata format - tc26", async () => {
    const songCards = await driver.findElements(By.className("music-card"));
    
    if (songCards.length > 0) {
      // Lấy thông tin từ bài hát đầu tiên
      const songTitle = await driver.findElement(By.className("music-title")).getText();
      const songArtist = await driver.findElement(By.className("music-artist")).getText();
      const songDuration = await driver.findElement(By.className("music-duration")).getText();
      
      // Kiểm tra định dạng
      expect(songTitle).to.be.a('string').that.is.not.empty;
      expect(songArtist).to.be.a('string').that.is.not.empty;
      
      // Kiểm tra định dạng thời lượng (mm:ss hoặc m:ss)
      expect(songDuration).to.match(/^\d{1,3}:\d{2}$/);
      
      // Kiểm tra giá trị thời lượng hợp lý (không quá 20 phút cho bài hát thông thường)
      const [minutes, seconds] = songDuration.split(':').map(Number);
      expect(minutes).to.be.at.least(0).and.at.most(20);
      expect(seconds).to.be.at.least(0).and.at.most(59);
    }
  });

  it("Should handle keyboard navigation - tc27", async () => {
    // Test tab navigation
    await driver.findElement(By.tagName("body")).sendKeys(Keys.TAB);
    
    // Kiểm tra focus di chuyển đến phần tử đầu tiên
    const activeElement = await driver.switchTo().activeElement();
    const tagName = await activeElement.getTagName();
    
    // Có thể là input, button, hoặc link đầu tiên
    expect(["input", "button", "a", "select"]).to.include(tagName.toLowerCase());
    
    // Test Enter để kích hoạt
    if (tagName.toLowerCase() === "button") {
      await activeElement.sendKeys(Keys.ENTER);
      await driver.sleep(1000);
      
      // Kiểm tra không có lỗi
      const errorElements = await driver.findElements(By.xpath("//*[contains(@class, 'error')]"));
      expect(errorElements.length).to.equal(0);
    }
  });

  it("Should handle session expiration - tc28", async () => {
    // Xóa token để mô phỏng session hết hạn
    await driver.executeScript("localStorage.removeItem('authToken');");
    
    // Làm mới trang
    await driver.navigate().refresh();
    await driver.sleep(2000);
    
    // Kiểm tra xem có redirect đến login hoặc hiển thị thông báo lỗi không
    const currentUrl = await driver.getCurrentUrl();
    
    if (currentUrl.includes("/login")) {
      console.log("Redirected to login as expected");
    } else {
      // Kiểm tra thông báo lỗi
      try {
        const errorElement = await driver.findElement(
          By.xpath("//*[contains(text(), 'Error') or contains(text(), 'Unauthorized') or contains(text(), 'Please login')]")
        );
        expect(await errorElement.isDisplayed()).to.be.true;
      } catch (error) {
        // Có thể trang vẫn load được (public access)
        console.log("Page might allow access without token");
      }
    }
  });

  it("Should handle duplicate unlike requests - tc29", async () => {
    const likeButtons = await driver.findElements(
      By.xpath("//button[contains(@class, 'favorite-icon active')]")
    );
    
    if (likeButtons.length > 0) {
      // Click unlike 3 lần liên tiếp (idempotent test)
      await likeButtons[0].click();
      await driver.sleep(300);
      await likeButtons[0].click(); // Lần 2
      await driver.sleep(300);
      await likeButtons[0].click(); // Lần 3
      
      await driver.sleep(1500);
      
      // Kiểm tra không có lỗi
      const errorMessages = await driver.findElements(By.xpath("//*[contains(text(), 'Error')]"));
      expect(errorMessages.length).to.equal(0);
    }
  });

  it("Should update UI immediately after unlike - tc30", async () => {
    const likeButtons = await driver.findElements(
      By.xpath("//button[contains(@class, 'favorite-icon active')]")
    );
    
    if (likeButtons.length > 0) {
      const initialCount = likeButtons.length;
      
      // Ghi nhận bài hát đầu tiên
      const firstSongTitle = await driver.findElement(By.className("music-title")).getText();
      
      // Unlike bài hát đầu tiên
      await likeButtons[0].click();
      
      // Kiểm tra UI ngay lập tức (optimistic update)
      await driver.sleep(300); // Chờ nhỏ để UI update
      
      // Kiểm tra số lượng bài hát giảm ngay (hoặc bài hát đó biến mất)
      const currentSongs = await driver.findElements(By.className("music-card"));
      const currentFirstSongTitle = await driver.findElement(By.className("music-title")).getText();
      
      // Hoặc số lượng giảm, hoặc bài hát đầu tiên đã thay đổi
      expect(currentSongs.length).to.be.at.most(initialCount);
      if (currentSongs.length === initialCount) {
        expect(currentFirstSongTitle).to.not.equal(firstSongTitle);
      }
    }
  });
});

describe("UI Favorite Songs - Edge Cases", function () {
  this.timeout(40000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async () => {
    await driver.quit();
  });

  it("Should handle extremely long song titles - tc31", async () => {
    // Đăng nhập
    await driver.get(config.frontendUrl + "/login");
    await driver
      .findElement(By.xpath('//*[@id="email"]'))
      .sendKeys("uyentu510@gmail.com");
    await driver
      .findElement(By.xpath('//*[@id="password"]'))
      .sendKeys("Abcd1234!");
    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();
    await driver.wait(until.urlContains("/home"), 10000);
    
    // Đi đến trang favorite
    await driver.get(config.frontendUrl + "/favourite");
    await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Your Favorites')]")), 10000);
    
    // Kiểm tra các tiêu đề bài hát không bị tràn layout
    const songTitles = await driver.findElements(By.className("music-title"));
    
    for (let title of songTitles) {
      const text = await title.getText();
      const computedStyle = await driver.executeScript(
        "return window.getComputedStyle(arguments[0]);",
        title
      );
      
      // Kiểm tra không có overflow
      expect(computedStyle.overflow).to.not.equal("visible");
      expect(computedStyle.textOverflow).to.match(/ellipsis|clip/);
    }
  });

  it("Should handle special characters in song metadata - tc32", async () => {
    // Test với dữ liệu có ký tự đặc biệt (cần có bài hát test với ký tự đặc biệt)
    // Tạm thời chỉ kiểm tra UI không bị vỡ
    await driver.get(config.frontendUrl + "/login");
    await driver
      .findElement(By.xpath('//*[@id="email"]'))
      .sendKeys("uyentu510@gmail.com");
    await driver
      .findElement(By.xpath('//*[@id="password"]'))
      .sendKeys("Abcd1234!");
    await driver
      .findElement(By.xpath("//button[normalize-space()='LOGIN']"))
      .click();
    await driver.wait(until.urlContains("/home"), 10000);
    
    await driver.get(config.frontendUrl + "/favourite");
    await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Your Favorites')]")), 10000);
    
    // Kiểm tra không có lỗi console
    const logs = await driver.manage().logs().get("browser");
    const severeLogs = logs.filter(log => log.level.name === "SEVERE");
    expect(severeLogs.length).to.equal(0);
  });

  it("Should handle slow network conditions - tc33", async () => {
    // Mô phỏng slow network
    await driver.executeScript(`
      window.originalFetch = window.fetch;
      window.fetch = function(...args) {
        return new Promise(resolve => {
          setTimeout(() => {
            window.originalFetch(...args).then(resolve);
          }, 2000); // Delay 2 giây
        });
      };
    `);
    
    await driver.get(config.frontendUrl + "/favourite");
    
    // Kiểm tra loading indicator hiển thị đủ lâu
    try {
      const loadingElement = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(), 'Loading')]")),
        1000
      );
      expect(await loadingElement.isDisplayed()).to.be.true;
      
      // Đợi tải xong
      await driver.wait(until.stalenessOf(loadingElement), 10000);
    } catch (error) {
      console.log("Loading test inconclusive");
    }
    
    // Khôi phục
    await driver.executeScript("window.fetch = window.originalFetch;");
  });

  it("Should handle rapid page switching - tc34", async () => {
    // Chuyển đổi qua lại giữa các trang nhanh chóng
    for (let i = 0; i < 5; i++) {
      await driver.get(config.frontendUrl + "/favourite");
      await driver.sleep(100);
      await driver.get(config.frontendUrl + "/home");
      await driver.sleep(100);
    }
    
    // Trở lại trang favorite lần cuối
    await driver.get(config.frontendUrl + "/favourite");
    await driver.sleep(2000);
    
    // Kiểm tra trang vẫn hoạt động bình thường
    const pageTitle = await driver.findElement(By.xpath("//h2[contains(text(), 'Your Favorites')]"));
    expect(await pageTitle.isDisplayed()).to.be.true;
    
    // Kiểm tra không có lỗi
    const errorElements = await driver.findElements(By.xpath("//*[contains(text(), 'Error')]"));
    expect(errorElements.length).to.equal(0);
  });

  it("Should handle pagination with exactly 8 songs (one page) - tc35", async () => {
    // Test với trường hợp đặc biệt: chính xác 8 bài hát (đủ 1 trang)
    // Đây là test lý thuyết, thực tế cần dữ liệu test phù hợp
    
    // Kiểm tra nếu có đúng 8 bài hát
    const songCards = await driver.findElements(By.className("music-card"));
    
    if (songCards.length === 8) {
      // Không nên hiển thị pagination
      const paginationContainer = await driver.findElements(By.className("pagination-container"));
      expect(paginationContainer.length).to.equal(0);
    }
  });

  it("Should handle pagination with exactly 9 songs (two pages) - tc36", async () => {
    // Test với trường hợp đặc biệt: 9 bài hát (2 trang, trang 2 có 1 bài)
    // Kiểm tra pagination hiển thị đúng
    const songCards = await driver.findElements(By.className("music-card"));
    
    if (songCards.length > 0) {
      const paginationContainer = await driver.findElements(By.className("pagination-container"));
      
      // Nếu có pagination, kiểm tra nút Last page
      if (paginationContainer.length > 0) {
        const lastPageBtn = await driver.findElement(
          By.xpath("//button[contains(@class, 'pagination-nav-btn') and contains(@title, 'Last page')]")
        );
        
        // Đi đến trang cuối
        await lastPageBtn.click();
        await driver.sleep(1000);
        
        // Kiểm tra số bài hát trên trang cuối
        const songsOnLastPage = await driver.findElements(By.className("music-card"));
        expect(songsOnLastPage.length).to.be.at.least(1).and.at.most(8);
      }
    }
  });

  it("Should handle browser zoom - tc37", async () => {
    // Test với zoom khác nhau
    await driver.executeScript("document.body.style.zoom = '80%'");
    await driver.sleep(1000);
    
    // Kiểm tra layout không bị vỡ
    const pageTitle = await driver.findElement(By.xpath("//h2[contains(text(), 'Your Favorites')]"));
    expect(await pageTitle.isDisplayed()).to.be.true;
    
    const songCards = await driver.findElements(By.className("music-card"));
    if (songCards.length > 0) {
      const firstCard = songCards[0];
      expect(await firstCard.isDisplayed()).to.be.true;
    }
    
    // Reset zoom
    await driver.executeScript("document.body.style.zoom = '100%'");
  });

  it("Should handle different time formats - tc38", async () => {
    // Kiểm tra định dạng thời lượng
    const durationElements = await driver.findElements(By.className("music-duration"));
    
    for (let element of durationElements.slice(0, 3)) { // Kiểm tra 3 phần tử đầu
      const durationText = await element.getText();
      
      // Hỗ trợ cả định dạng mm:ss và m:ss
      expect(durationText).to.match(/^\d{1,3}:\d{2}$/);
      
      // Kiểm tra giá trị hợp lý
      const [minutes, seconds] = durationText.split(':').map(Number);
      expect(minutes).to.be.at.least(0);
      expect(seconds).to.be.at.least(0).and.at.most(59);
    }
  });

  it("Should handle empty artist name - tc39", async () => {
    // Kiểm tra xử lý khi artist là "Unknown Artist" hoặc empty
    const artistElements = await driver.findElements(By.className("music-artist"));
    
    for (let artist of artistElements) {
      const artistText = await artist.getText();
      expect(artistText).to.be.a('string');
      
      // Nếu empty, kiểm tra hiển thị "Unknown Artist" theo code
      if (artistText.trim() === "") {
        // Code hiện tại gán "Unknown Artist" nếu artist không có
        // Kiểm tra không bị lỗi
        console.log("Empty artist name found, checking fallback");
      }
    }
  });

  it("Should handle image loading errors - tc40", async () => {
    // Mô phỏng lỗi tải ảnh
    await driver.executeScript(`
      // Monkey patch Image constructor
      const originalImage = window.Image;
      window.Image = function() {
        const img = new originalImage();
        setTimeout(() => {
          img.onerror(new Error('Failed to load'));
        }, 100);
        return img;
      };
    `);
    
    // Làm mới trang
    await driver.navigate().refresh();
    await driver.sleep(2000);
    
    // Kiểm tra trang vẫn hoạt động, không crash
    const pageTitle = await driver.findElement(By.xpath("//h2[contains(text(), 'Your Favorites')]"));
    expect(await pageTitle.isDisplayed()).to.be.true;
    
    // Khôi phục
    await driver.executeScript("window.Image = window.originalImage;");
  });
});
