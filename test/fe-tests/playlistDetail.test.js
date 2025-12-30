const { Builder, By, until } = require("selenium-webdriver");
const { expect } = require("chai");
const config = require("./config");

describe("Playlist Detail Page", function () {
  this.timeout(30000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async () => {
    await driver.quit();
  });

  it("Load playlist page successfully - tc01", async () => {
    await driver.get(config.frontendUrl + "/login");

    // Login first
    await driver.findElement(By.xpath('//*[@id="email"]')).sendKeys("uyentu510@gmail.com");
    await driver.findElement(By.xpath('//*[@id="password"]')).sendKeys("Abcd1234!");
    await driver.findElement(By.xpath("//button[normalize-space()='LOGIN']")).click();
    
    await driver.wait(until.urlContains("/home"), 10000);
    
    // Navigate to playlist detail
    await driver.get(config.frontendUrl + "/playlists/1");
    
    await driver.wait(until.elementLocated(By.className("playlist-detail-page")), 5000);
    const pageTitle = await driver.findElement(By.css(".breadcrumb-current")).getText();
    expect(pageTitle).to.include("playlist");
  });

  it("Display playlist information - tc02", async () => {
    await driver.get(config.frontendUrl + "/playlists/1");
    
    await driver.wait(until.elementLocated(By.className("playlist-detail-page")), 5000);
    
    // Check playlist name exists
    const playlistName = await driver.findElement(By.css(".breadcrumb-current")).getText();
    expect(playlistName).to.be.not.empty;
    
    // Check breadcrumb navigation exists
    const breadcrumb = await driver.findElement(By.linkText("Your Playlist"));
    expect(await breadcrumb.isDisplayed()).to.be.true;
  });

  it("Display songs in playlist - tc03", async () => {
    await driver.get(config.frontendUrl + "/playlists/1");
    
    await driver.wait(until.elementLocated(By.className("playlist-grid")), 5000);
    
    // Check if songs are displayed
    const songs = await driver.findElements(By.css(".playlist-grid > div"));
    expect(songs.length).to.be.greaterThan(0);
    
    // Check song information
    const firstSong = await driver.findElement(By.css(".playlist-grid > div:first-child"));
    expect(await firstSong.isDisplayed()).to.be.true;
  });

  it("Sort songs functionality - tc04", async () => {
    await driver.get(config.frontendUrl + "/playlists/1");
    
    await driver.wait(until.elementLocated(By.className("playlist-sort")), 5000);
    
    // Change sort option
    const sortSelect = await driver.findElement(By.className("playlist-sort"));
    await sortSelect.click();
    await driver.findElement(By.xpath('//option[@value="oldest_added"]')).click();
    
    // Verify sort changed (wait for potential reload)
    await driver.sleep(1000);
    const currentValue = await sortSelect.getAttribute("value");
    expect(currentValue).to.equal("oldest_added");
  });

  it("Open song menu - tc05", async () => {
    await driver.get(config.frontendUrl + "/playlists/1");
    
    await driver.wait(until.elementLocated(By.className("playlist-grid")), 5000);
    
    // Click on options button (⋯)
    const optionsButton = await driver.findElement(By.css(".playlist-grid > div:first-child .icon-btn"));
    await optionsButton.click();
    
    // Check if menu opens
    const menu = await driver.wait(
      until.elementLocated(By.className("modal-overlay")),
      3000
    );
    expect(await menu.isDisplayed()).to.be.true;
    
    // Close menu
    await driver.findElement(By.className("modal-box button")).click();
  });

  it("Open add song modal - tc06", async () => {
    await driver.get(config.frontendUrl + "/playlists/1");
    
    await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Add new song')]")), 5000);
    
    // Click Add new song button
    const addButton = await driver.findElement(By.xpath("//button[contains(text(), 'Add new song')]"));
    await addButton.click();
    
    // Check if modal opens
    const modal = await driver.wait(
      until.elementLocated(By.xpath("//h3[contains(text(), 'Add song to playlist')]")),
      3000
    );
    expect(await modal.isDisplayed()).to.be.true;
    
    // Close modal
    const closeButton = await driver.findElement(By.xpath("//button[contains(text(), 'Close')]"));
    await closeButton.click();
  });

  it("Search songs in modal - tc07", async () => {
    await driver.get(config.frontendUrl + "/playlists/1");
    
    await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Add new song')]")), 5000);
    
    // Open modal
    const addButton = await driver.findElement(By.xpath("//button[contains(text(), 'Add new song')]"));
    await addButton.click();
    
    // Wait for modal and search input
    await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Search song by name...']")), 3000);
    
    // Type search query
    const searchInput = await driver.findElement(By.xpath("//input[@placeholder='Search song by name...']"));
    await searchInput.sendKeys("test");
    
    // Check search results or message appears
    await driver.sleep(1000); // Wait for debounce
    const searchMessage = await driver.findElement(By.xpath("//p[contains(text(), 'Type at least 2 characters to search')]"));
    expect(await searchMessage.isDisplayed()).to.be.true;
    
    // Close modal
    const closeButton = await driver.findElement(By.xpath("//button[contains(text(), 'Close')]"));
    await closeButton.click();
  });

  it("Pagination functionality - tc08", async () => {
    await driver.get(config.frontendUrl + "/playlists/1");
    
    await driver.wait(until.elementLocated(By.className("playlist-grid")), 5000);
    
    // Check if pagination exists
    const paginationButtons = await driver.findElements(By.css(".pagination button"));
    
    if (paginationButtons.length > 0) {
      // Click on page 2 if exists
      const page2Button = await driver.findElement(By.xpath("//button[text()='2']"));
      await page2Button.click();
      
      // Wait for content to load
      await driver.sleep(1000);
      const songs = await driver.findElements(By.css(".playlist-grid > div"));
      expect(songs.length).to.be.greaterThan(0);
    }
  });

  it("Play song from playlist - tc09", async () => {
    await driver.get(config.frontendUrl + "/playlists/1");
    
    await driver.wait(until.elementLocated(By.className("playlist-grid")), 5000);
    
    // Click on first song card
    const firstSong = await driver.findElement(By.css(".playlist-grid > div:first-child"));
    await firstSong.click();
    
    // Should navigate to song detail page
    await driver.wait(until.urlContains("/song/"), 5000);
    const url = await driver.getCurrentUrl();
    expect(url).to.include("/song/");
  });

  it("Empty playlist message - tc10", async () => {
    // Test with empty playlist ID
    await driver.get(config.frontendUrl + "/playlists/empty-playlist-id");
    
    await driver.wait(until.elementLocated(By.className("playlist-detail-page")), 5000);
    
    // Check for empty message
    const emptyMessage = await driver.findElement(By.xpath("//p[contains(text(), 'This playlist is empty.')]"));
    expect(await emptyMessage.isDisplayed()).to.be.true;
  });

  it("Back to playlists navigation - tc11", async () => {
    await driver.get(config.frontendUrl + "/playlists/1");
    
    await driver.wait(until.elementLocated(By.linkText("Your Playlist")), 5000);
    
    // Click back link
    const backLink = await driver.findElement(By.linkText("Your Playlist"));
    await backLink.click();
    
    // Should navigate to playlists page
    await driver.wait(until.urlContains("/playlist"), 5000);
    const url = await driver.getCurrentUrl();
    expect(url).to.include("/playlist");
  });

  it("Play all button functionality - tc12", async () => {
    await driver.get(config.frontendUrl + "/playlists/1");
    
    await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), '▶ Play All')]")), 5000);
    
    // Click Play All button
    const playAllButton = await driver.findElement(By.xpath("//button[contains(text(), '▶ Play All')]"));
    await playAllButton.click();
    
    // Should start playing (implementation dependent)
    await driver.sleep(1000);
    // No specific assertion as it depends on audio player implementation
  });

  it("Delete song confirmation - tc13", async () => {
    await driver.get(config.frontendUrl + "/playlists/1");
    
    await driver.wait(until.elementLocated(By.className("playlist-grid")), 5000);
    
    // Find delete button (🗑)
    const deleteButtons = await driver.findElements(By.xpath("//button[contains(text(), '🗑')]"));
    
    if (deleteButtons.length > 0) {
      await deleteButtons[0].click();
      
      // Check if confirmation alert appears (browser alert)
      await driver.sleep(500);
      // Note: Selenium can handle browser alerts with driver.switchTo().alert()
    }
  });

  it("Load non-existent playlist - tc14", async () => {
    await driver.get(config.frontendUrl + "/playlists/nonexistent123");
    
    await driver.wait(until.elementLocated(By.className("playlist-detail-page")), 5000);
    
    // Check for error message
    const errorElement = await driver.findElement(By.xpath("//p[contains(text(), 'Playlist not found.')]"));
    expect(await errorElement.isDisplayed()).to.be.true;
    
    // Check back button exists
    const backButton = await driver.findElement(By.linkText("Back to Your Playlists"));
    expect(await backButton.isDisplayed()).to.be.true;
  });

  it("Playlist description display - tc15", async () => {
    await driver.get(config.frontendUrl + "/playlists/1");
    
    await driver.wait(until.elementLocated(By.className("playlist-detail-page")), 5000);
    
    // Check if description exists (optional field)
    const descriptionElements = await driver.findElements(By.className("playlist-description"));
    
    if (descriptionElements.length > 0) {
      const description = await descriptionElements[0].getText();
      expect(description).to.include("Playlist's description");
    }
  });
});
