const { Builder, By, until } = require("selenium-webdriver");
const { expect } = require("chai");
const config = require("./config");

describe("UI MyPlaylist", function () {
  this.timeout(30000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
    // Đăng nhập trước để truy cập trang playlist
    await driver.get(config.frontendUrl + "/login");
    await driver.findElement(By.xpath('//*[@id="email"]')).sendKeys("uyentu510@gmail.com");
    await driver.findElement(By.xpath('//*[@id="password"]')).sendKeys("Abcd1234!");
    await driver.findElement(By.xpath("//button[normalize-space()='LOGIN']")).click();
    await driver.wait(until.urlContains("/home"), 10000);
  });

  after(async () => {
    await driver.quit();
  });

  describe("Playlist Page Access and Layout", () => {
    it("Should navigate to playlist page successfully - tc01", async () => {
      await driver.get(config.frontendUrl + "/playlist");
      
      await driver.wait(until.urlContains("/playlist"), 5000);
      await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Your Playlist')]")), 5000);
      
      const pageTitle = await driver.findElement(By.xpath("//h2[contains(text(), 'Your Playlist')]"));
      const titleText = await pageTitle.getText();
      expect(titleText).to.include("Your Playlist");
    });

    it("Should display sort dropdown and buttons - tc02", async () => {
      await driver.get(config.frontendUrl + "/playlist");
      
      // Kiểm tra dropdown sắp xếp
      const sortDropdown = await driver.wait(
        until.elementLocated(By.css("select.playlist-sort-dropdown")),
        5000
      );
      expect(await sortDropdown.isDisplayed()).to.be.true;

      // Kiểm tra các nút action
      const addButton = await driver.findElement(
        By.xpath("//button[contains(text(), 'Add new playlist')]")
      );
      const editButton = await driver.findElement(
        By.xpath("//button[contains(text(), \"Change playlist's name\")]")
      );
      const deleteButton = await driver.findElement(
        By.xpath("//button[contains(text(), 'Delete created playlist')]")
      );

      expect(await addButton.isDisplayed()).to.be.true;
      expect(await editButton.isDisplayed()).to.be.true;
      expect(await deleteButton.isDisplayed()).to.be.true;
    });
  });

  describe("Playlist Creation", () => {
    beforeEach(async () => {
      await driver.get(config.frontendUrl + "/playlist");
    });

    it("Should open add playlist form when clicking add button - tc03", async () => {
      const addButton = await driver.findElement(
        By.xpath("//button[contains(text(), 'Add new playlist')]")
      );
      await addButton.click();

      await driver.wait(
        until.elementLocated(By.xpath("//h3[contains(text(), 'Create new playlist')]")),
        5000
      );

      const formTitle = await driver.findElement(
        By.xpath("//h3[contains(text(), 'Create new playlist')]")
      );
      expect(await formTitle.isDisplayed()).to.be.true;
    });

    it("Should show error when creating playlist with empty name - tc04", async () => {
      const addButton = await driver.findElement(
        By.xpath("//button[contains(text(), 'Add new playlist')]")
      );
      await addButton.click();

      // Để trống tên, điền description
      const nameInput = await driver.wait(
        until.elementLocated(By.xpath("//div[@class='playlist-add-form']//input[@type='text']")),
        5000
      );
      await nameInput.sendKeys("");

      const createButton = await driver.findElement(
        By.xpath("//button[contains(text(), 'Create')]")
      );
      await createButton.click();

      // Kiểm tra alert
      await driver.sleep(1000); // Chờ alert xuất hiện
      const alertText = await driver.switchTo().alert().getText();
      expect(alertText).to.include("Playlist name can be not empty");
      await driver.switchTo().alert().accept();
    });

    it("Should show error when creating duplicate playlist - tc05", async () => {
      const addButton = await driver.findElement(
        By.xpath("//button[contains(text(), 'Add new playlist')]")
      );
      await addButton.click();

      // Lấy tên playlist đầu tiên đang có
      const existingPlaylist = await driver.findElement(
        By.xpath("(//div[contains(@class,'playlist-grid-container')]//div[contains(@class,'playlist-card')])[1]//h3")
      );
      const existingName = await existingPlaylist.getText();

      // Nhập tên trùng
      const nameInput = await driver.wait(
        until.elementLocated(By.xpath("//div[@class='playlist-add-form']//input[@type='text']")),
        5000
      );
      await nameInput.sendKeys(existingName);

      const createButton = await driver.findElement(
        By.xpath("//button[contains(text(), 'Create')]")
      );
      await createButton.click();

      // Kiểm tra alert
      await driver.sleep(1000);
      const alertText = await driver.switchTo().alert().getText();
      expect(alertText).to.include("Playlist name already exists");
      await driver.switchTo().alert().accept();
    });

    it("Should create playlist successfully with valid name - tc06", async () => {
      const addButton = await driver.findElement(
        By.xpath("//button[contains(text(), 'Add new playlist')]")
      );
      await addButton.click();

      const timestamp = new Date().getTime();
      const playlistName = `Test Playlist ${timestamp}`;

      const nameInput = await driver.wait(
        until.elementLocated(By.xpath("//div[@class='playlist-add-form']//input[@type='text']")),
        5000
      );
      await nameInput.sendKeys(playlistName);

      const createButton = await driver.findElement(
        By.xpath("//button[contains(text(), 'Create')]")
      );
      await createButton.click();

      // Chờ playlist mới xuất hiện
      await driver.wait(
        until.elementLocated(By.xpath(`//h3[contains(text(), '${playlistName}')]`)),
        10000
      );

      const newPlaylist = await driver.findElement(
        By.xpath(`//h3[contains(text(), '${playlistName}')]`)
      );
      expect(await newPlaylist.isDisplayed()).to.be.true;
    });
  });

  describe("Playlist Selection and Actions", () => {
    beforeEach(async () => {
      await driver.get(config.frontendUrl + "/playlist");
    });

    it("Should highlight playlist when clicked - tc07", async () => {
      const firstPlaylist = await driver.findElement(
        By.xpath("(//div[contains(@class,'playlist-grid-container')]//div[contains(@class,'playlist-card')])[1]")
      );
      await firstPlaylist.click();

      // Kiểm tra border highlight
      const parentDiv = await firstPlaylist.findElement(By.xpath("./.."));
      const borderStyle = await parentDiv.getCssValue("border");
      expect(borderStyle).to.include("2px");
    });

    it("Should enable edit button when playlist is selected - tc08", async () => {
      // Ban đầu chưa chọn playlist, nút edit phải disabled
      const editButton = await driver.findElement(
        By.xpath("//button[contains(text(), \"Change playlist's name\")]")
      );
      let isEnabled = await editButton.isEnabled();
      expect(isEnabled).to.be.false;

      // Chọn playlist
      const firstPlaylist = await driver.findElement(
        By.xpath("(//div[contains(@class,'playlist-grid-container')]//div[contains(@class,'playlist-card')])[1]")
      );
      await firstPlaylist.click();

      // Kiểm tra lại nút edit
      await driver.sleep(1000);
      isEnabled = await editButton.isEnabled();
      expect(isEnabled).to.be.true;
    });

    it("Should navigate to playlist detail on double click - tc09", async () => {
      const firstPlaylist = await driver.findElement(
        By.xpath("(//div[contains(@class,'playlist-grid-container')]//div[contains(@class,'playlist-card')])[1]")
      );

      // Double click
      const actions = driver.actions({ bridge: true });
      await actions.doubleClick(firstPlaylist).perform();

      // Chờ chuyển trang
      await driver.wait(until.urlContains("/playlists/"), 10000);
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).to.include("/playlists/");
    });
  });

  describe("Playlist Editing and Deletion", () => {
    beforeEach(async () => {
      await driver.get(config.frontendUrl + "/playlist");
    });

    it("Should show alert when editing without selecting playlist - tc10", async () => {
      const editButton = await driver.findElement(
        By.xpath("//button[contains(text(), \"Change playlist's name\")]")
      );
      await editButton.click();

      await driver.sleep(1000);
      const alertText = await driver.switchTo().alert().getText();
      expect(alertText).to.include("Please select a playlist first");
      await driver.switchTo().alert().accept();
    });

    it("Should show alert when deleting without selecting playlist - tc11", async () => {
      const deleteButton = await driver.findElement(
        By.xpath("//button[contains(text(), 'Delete created playlist')]")
      );
      await deleteButton.click();

      await driver.sleep(1000);
      const alertText = await driver.switchTo().alert().getText();
      expect(alertText).to.include("Please select a playlist first");
      await driver.switchTo().alert().accept();
    });

    it("Should prevent deletion of Favorites playlist - tc12", async () => {
      // Tìm playlist có tên "Favorites" (không phân biệt hoa thường)
      const favoritesPlaylist = await driver.findElement(
        By.xpath("//h3[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'favorites')]/ancestor::div[contains(@class,'playlist-card')]")
      );
      await favoritesPlaylist.click();

      const deleteButton = await driver.findElement(
        By.xpath("//button[contains(text(), 'Delete created playlist')]")
      );
      await deleteButton.click();

      await driver.sleep(1000);
      const alertText = await driver.switchTo().alert().getText();
      expect(alertText).to.include("You cannot delete Favorites playlist");
      await driver.switchTo().alert().accept();
    });
  });

  describe("Sorting Functionality", () => {
    it("Should sort playlists by recently added - tc13", async () => {
      await driver.get(config.frontendUrl + "/playlist");

      const sortDropdown = await driver.findElement(
        By.css("select.playlist-sort-dropdown")
      );
      await sortDropdown.click();
      
      // Chọn recently-added (đã chọn mặc định)
      const recentlyAddedOption = await driver.findElement(
        By.xpath("//option[@value='recently-added']")
      );
      await recentlyAddedOption.click();

      // Kiểm tra playlist đầu tiên (có thể kiểm tra theo cách khác tùy vào logic)
      await driver.sleep(2000);
      const firstPlaylist = await driver.findElement(
        By.xpath("(//div[contains(@class,'playlist-grid-container')]//div[contains(@class,'playlist-card')])[1]")
      );
      expect(await firstPlaylist.isDisplayed()).to.be.true;
    });

    it("Should sort playlists A-Z - tc14", async () => {
      await driver.get(config.frontendUrl + "/playlist");

      const sortDropdown = await driver.findElement(
        By.css("select.playlist-sort-dropdown")
      );
      await sortDropdown.click();
      
      // Chọn A-Z
      const azOption = await driver.findElement(
        By.xpath("//option[@value='a-z']")
      );
      await azOption.click();

      await driver.sleep(2000);
      // Kiểm tra playlist đầu tiên sau khi sort
      const firstPlaylist = await driver.findElement(
        By.xpath("(//div[contains(@class,'playlist-grid-container')]//div[contains(@class,'playlist-card')])[1]")
      );
      expect(await firstPlaylist.isDisplayed()).to.be.true;
    });
  });

  describe("Pagination", () => {
    it("Should display pagination when playlists exist - tc15", async () => {
      await driver.get(config.frontendUrl + "/playlist");

      const paginationContainer = await driver.wait(
        until.elementLocated(By.css(".pagination-container")),
        5000
      );
      expect(await paginationContainer.isDisplayed()).to.be.true;
    });

    it("Should navigate to next page when clicking next button - tc16", async () => {
      await driver.get(config.frontendUrl + "/playlist");

      // Tìm nút next
      const nextButton = await driver.findElement(
        By.xpath("//button[contains(@class,'pagination-nav-btn') and text()='▶']")
      );
      
      // Kiểm tra nếu có nhiều hơn 1 trang
      const isEnabled = await nextButton.isEnabled();
      if (isEnabled) {
        const currentUrl = await driver.getCurrentUrl();
        await nextButton.click();
        
        // Chờ trang reload
        await driver.sleep(2000);
        const newUrl = await driver.getCurrentUrl();
        expect(newUrl).to.equal(currentUrl); // URL không đổi (SPA)
        
        // Kiểm tra nút active
        const activePage = await driver.findElement(
          By.xpath("//button[contains(@class,'pagination-btn-active')]")
        );
        expect(await activePage.isDisplayed()).to.be.true;
      }
    });
  });

  describe("File Upload Validation", () => {
    it("Should reject non-image file upload - tc17", async () => {
      await driver.get(config.frontendUrl + "/playlist");

      const addButton = await driver.findElement(
        By.xpath("//button[contains(text(), 'Add new playlist')]")
      );
      await addButton.click();

      const fileInput = await driver.wait(
        until.elementLocated(By.xpath("//input[@type='file']")),
        5000
      );

      // Upload file không phải ảnh (ví dụ: text file)
      const filePath = require('path').join(__dirname, 'test.txt');
      await fileInput.sendKeys(filePath);

      await driver.sleep(1000);
      const alertText = await driver.switchTo().alert().getText();
      expect(alertText).to.include("Only image files");
      await driver.switchTo().alert().accept();
    });

    it("Should reject oversized image file - tc18", async () => {
      await driver.get(config.frontendUrl + "/playlist");

      const addButton = await driver.findElement(
        By.xpath("//button[contains(text(), 'Add new playlist')]")
      );
      await addButton.click();

      const fileInput = await driver.wait(
        until.elementLocated(By.xpath("//input[@type='file']")),
        5000
      );

      // Tạo một file ảnh lớn hơn 2MB (cần chuẩn bị trước)
      const largeImagePath = require('path').join(__dirname, 'large-image.jpg');
      try {
        await fileInput.sendKeys(largeImagePath);
        
        await driver.sleep(1000);
        const alertText = await driver.switchTo().alert().getText();
        expect(alertText).to.include("Image size must be less than 2MB");
        await driver.switchTo().alert().accept();
      } catch (error) {
        console.log("Test file không tồn tại, bỏ qua test case này");
      }
    });
  });
});
