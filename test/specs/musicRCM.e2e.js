import assert from "assert";
import path from "path";

describe("Music Recommendation Module", () => {
  //TC-MusicRcm01 - User is null
  //
  it("TC-MusicRcm01 - View the trending songs list fails when userDetails is null → MSG011", async () => {
    //
    // 1. Load trang chủ trước để có origin hợp lệ
    //
    await browser.url("/");

    //
    // 2. Xóa token trong localStorage
    //
    await browser.execute(() => {
      localStorage.removeItem("authToken");
      sessionStorage.clear();
    });

    await browser.url("/home");
    let currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/home"), "Home page did not load");

    const errorMsg = $('//*[contains(text(),"User not found")]');
    await browser.waitUntil(async () => await errorMsg.isDisplayed(), {
      timeout: 1000,
      timeoutMsg: "MSG011 – User not found not shown",
    });

    await browser.pause(1000);
  });
  //TC-MusicRcm04 - User is null
  //
  it("TC-MusicRcm04 - the Made for you songs list fails when userDetails is null → MSG011", async () => {
    //
    // 1. Load trang chủ trước để có origin hợp lệ
    //
    await browser.url("/");

    //
    // 2. Xóa token trong localStorage
    //
    await browser.execute(() => {
      localStorage.removeItem("authToken");
      sessionStorage.clear();
    });

    await browser.url("/home");
    let currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/home"), "Home page did not load");

    const errorMsg = $('//*[contains(text(),"User not found")]');
    await browser.waitUntil(async () => await errorMsg.isDisplayed(), {
      timeout: 1000,
      timeoutMsg: "MSG011 – User not found not shown",
    });

    await browser.pause(1000);
  });
  //
});
