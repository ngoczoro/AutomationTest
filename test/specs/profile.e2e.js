import assert from "assert";
import path from "path";

describe("Profile Module", () => {
  //
  // TC-PROFILE 01 - User is null
  //
  it("TC-Profile01 - UserDetails is null → MSG011", async () => {
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

    await browser.url("/profile");
    let currentUrl = await browser.getUrl();
    assert(currentUrl.includes("/profile"), "Profile page did not load");

    const errorMsg = $('//*[contains(text(),"User not found")]');
    await browser.waitUntil(async () => await errorMsg.isDisplayed(), {
      timeout: 1000,
      timeoutMsg: "MSG011 – User not found not shown",
    });

    await browser.pause(1000);
  });
  //
  // TC-PROFILE 02 - Update full name successfully
  //
  it("TC-Profile02 - User can update full name successfully", async () => {
    await browser.url("/login");

    await $("#email").setValue("23521019@gm.uit.edu.vn");
    await $("#password").setValue("22022005Bn#");
    await $('button[type="submit"]').click();

    await browser.waitUntil(
      async () => (await browser.getUrl()).includes("/home"),
      { timeout: 5000, timeoutMsg: "Login failed" }
    );

    await browser.refresh();

    await browser.url("/profile");
    assert((await browser.getUrl()).includes("/profile"));

    await $(".edit-btn").click();

    const fullNameInput = $(".form-grid > div:nth-child(1) input");

    await fullNameInput.waitForDisplayed({ timeout: 3000 });

    await fullNameInput.click();
    await browser.keys(["Control", "a"]);
    await browser.keys("Delete");

    await fullNameInput.setValue("Đào Ngọc");
    assert.equal(await fullNameInput.getValue(), "Đào Ngọc");

    await $('button[type="submit"]').click();

    await browser.waitUntil(
      async () => (await browser.getUrl()).includes("/profile"),
      { timeout: 5000, timeoutMsg: "Page did not reload to Profile" }
    );

    await browser.pause(1000);

    // check tên hiển thị trên trang Profile
    const displayedName = $('//*[contains(text(), "Đào Ngọc")]');
    await browser.waitUntil(async () => await displayedName.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "Updated full name not visible on Profile page",
    });

    await browser.pause(1000);
  });
  //
  // TC-PROFILE 03 - Upload avatar successfully
  //
  it("TC-Profile03 - Upload avatar successfully", async () => {
    // 1. Đi đến trang Edit Profile
    await browser.url("/profile");
    await $(".edit-btn").click();

    // --- UNHIDE FILE INPUT ---
    await browser.execute(() => {
      const el = document.getElementById("avatar-upload");
      el.removeAttribute("hidden");
      el.style.display = "block";
    });
    // 2. Chuẩn bị file upload
    const filePath = path.join(process.cwd(), "test/resources/dog.jpg");
    const remoteFilePath = await browser.uploadFile(filePath);

    // 3. Gán file vào input hidden
    const avatarInput = $("#avatar-upload");
    await avatarInput.setValue(remoteFilePath);

    // 4. Kiểm tra preview xuất hiện
    const previewImg = $('img[alt="avatar"]');
    await browser.waitUntil(async () => await previewImg.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "Avatar preview not shown",
    });

    // 5. Lưu thay đổi
    await $('button[type="submit"]').click();

    // 6. Chờ reload vào Profile
    await browser.waitUntil(
      async () => (await browser.getUrl()).includes("/profile"),
      { timeout: 5000 }
    );

    // 7. Kiểm tra avatar mới hiển thị
    const profileAvatar = $('img[alt="avatar"]');
    await browser.waitUntil(async () => await profileAvatar.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "Updated avatar not displayed",
    });
  });
  //
  // TC-PROFILE 04 - Update bio successfully
  //
  it("TC-Profile04 - User can update bio successfully", async () => {
    // 1. Đi đến trang Edit Profile
    await browser.url("/profile");
    await $(".edit-btn").click();

    const bioInput = $(".bio-section textarea");

    await bioInput.waitForDisplayed({ timeout: 3000 });

    await bioInput.click();
    await browser.keys(["Control", "a"]);
    await browser.keys("Delete");

    await bioInput.setValue("Music is my life");
    assert.equal(await bioInput.getValue(), "Music is my life");

    await $('button[type="submit"]').click();

    await browser.waitUntil(
      async () => (await browser.getUrl()).includes("/profile"),
      { timeout: 5000, timeoutMsg: "Page did not reload to Profile" }
    );

    await browser.pause(1000);

    // check tên hiển thị trên trang Profile
    const displayedBio = $('//*[contains(text(), "Music is my life")]');
    await browser.waitUntil(async () => await displayedBio.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "Updated bio not visible on Profile page",
    });

    await browser.pause(1000);
  });
  //
  // TC-PROFILE 05 - Update full profile successfully
  //
  it("TC-Profile05 - User can update multiple fields successfully", async () => {
    await browser.url("/profile");
    assert((await browser.getUrl()).includes("/profile"));

    await $(".edit-btn").click();

    const fullNameInput = $(".form-grid > div:nth-child(1) input");

    await fullNameInput.waitForDisplayed({ timeout: 3000 });

    await fullNameInput.click();
    await browser.keys(["Control", "a"]);
    await browser.keys("Delete");

    await fullNameInput.setValue("Bảo Ngọc");
    assert.equal(await fullNameInput.getValue(), "Bảo Ngọc");

    await browser.execute(() => {
      const el = document.getElementById("avatar-upload");
      el.removeAttribute("hidden");
      el.style.display = "block";
    });

    const filePath = path.join(process.cwd(), "test/resources/rabbit.jpg");
    const remoteFilePath = await browser.uploadFile(filePath);

    const avatarInput = $("#avatar-upload");
    await avatarInput.setValue(remoteFilePath);

    const previewImg = $('img[alt="avatar"]');
    await browser.waitUntil(async () => await previewImg.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "Avatar preview not shown",
    });

    const bioInput = $(".bio-section textarea");

    await bioInput.waitForDisplayed({ timeout: 3000 });

    await bioInput.click();
    await browser.keys(["Control", "a"]);
    await browser.keys("Delete");

    await bioInput.setValue("Play music with me!!!");
    assert.equal(await bioInput.getValue(), "Play music with me!!!");

    await $('button[type="submit"]').click();

    await browser.waitUntil(
      async () => (await browser.getUrl()).includes("/profile"),
      { timeout: 5000, timeoutMsg: "Page did not reload to Profile" }
    );

    await browser.pause(1000);

    const displayedName = $('//*[contains(text(), "Bảo Ngọc")]');
    await browser.waitUntil(async () => await displayedName.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "Updated full name not visible on Profile page",
    });

    const profileAvatar = $('img[alt="avatar"]');
    await browser.waitUntil(async () => await profileAvatar.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "Updated avatar not displayed",
    });

    const displayedBio = $('//*[contains(text(), "Play music with me!!!")]');
    await browser.waitUntil(async () => await displayedBio.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "Updated bio not visible on Profile page",
    });

    await browser.pause(1000);
  });
  //
  // TC-PROFILE 06 - Update full name is null
  //
  it("TC-Profile06 - Update full name is null -> Profile Information with old full name", async () => {
    await browser.url("/profile");

    const profileNameElement = $(
      "#root > div > div.page-content > div > div > div.profile-page > div.profile-header > div.profile-info > div.profile-left > div.profile-details > h1"
    );

    await profileNameElement.waitForDisplayed({ timeout: 3000 });
    const oldName = await profileNameElement.getText();

    await $(".edit-btn").click();

    const fullNameInput = $(".form-grid > div:nth-child(1) input");

    await fullNameInput.waitForDisplayed({ timeout: 3000 });

    await fullNameInput.click();
    await browser.keys(["Control", "a"]);
    await browser.keys("Delete");

    await fullNameInput.setValue("");
    assert.equal(await fullNameInput.getValue(), "");

    await $('button[type="submit"]').click();

    await browser.waitUntil(
      async () => (await browser.getUrl()).includes("/profile"),
      { timeout: 5000, timeoutMsg: "Page did not reload to Profile" }
    );

    await browser.pause(1000);

    // check tên hiển thị trên trang Profile
    const currentName = await profileNameElement.getText();
    assert.equal(currentName, oldName);

    await browser.pause(1000);
  });
  //
  // TC-PROFILE 07 - Full name contains only whitespace
  //
  it("TC-Profile07 - Full name contains only whitespace -> Profile Information with old full name ", async () => {
    await browser.url("/profile");

    const profileNameElement = $(
      "#root > div > div.page-content > div > div > div.profile-page > div.profile-header > div.profile-info > div.profile-left > div.profile-details > h1"
    );

    await profileNameElement.waitForDisplayed({ timeout: 3000 });
    const oldName = await profileNameElement.getText();

    await $(".edit-btn").click();

    const fullNameInput = $(".form-grid > div:nth-child(1) input");

    await fullNameInput.waitForDisplayed({ timeout: 3000 });

    await fullNameInput.click();
    await browser.keys(["Control", "a"]);
    await browser.keys("Delete");

    await fullNameInput.setValue(" ");
    assert.equal(await fullNameInput.getValue(), " ");

    await $('button[type="submit"]').click();

    await browser.waitUntil(
      async () => (await browser.getUrl()).includes("/profile"),
      { timeout: 5000, timeoutMsg: "Page did not reload to Profile" }
    );

    await browser.pause(1000);

    // check tên hiển thị trên trang Profile
    const currentName = await profileNameElement.getText();
    assert.equal(currentName, oldName);

    await browser.pause(1000);
  });
  //
  // TC-PROFILE 08 -  Full name too long
  //
  it("TC-Profile08 - Full name too long → should NOT update profile", async () => {
    await browser.url("/profile");

    const profileNameElement = $(
      "#root > div > div.page-content > div > div > div.profile-page > div.profile-header > div.profile-info > div.profile-left > div.profile-details > h1"
    );

    await profileNameElement.waitForDisplayed({ timeout: 3000 });
    const oldName = await profileNameElement.getText();

    await $(".edit-btn").click();

    const longName = "v".repeat(120);

    const fullNameInput = $(".form-grid > div:nth-child(1) input");
    await fullNameInput.waitForDisplayed({ timeout: 3000 });

    await fullNameInput.click();
    await browser.keys(["Control", "a"]);
    await browser.keys("Delete");

    await fullNameInput.setValue(longName);
    assert.equal(await fullNameInput.getValue(), longName);

    await $('button[type="submit"]').click();
    await browser.waitUntil(
      async () => (await browser.getUrl()).includes("/profile"),
      { timeout: 5000, timeoutMsg: "Page did not reload to Profile" }
    );

    await browser.pause(1000);

    // check tên hiển thị trên trang Profile
    const currentName = await profileNameElement.getText();
    assert.equal(currentName, oldName);

    await browser.pause(1000);
  });
  //
  // TC-PROFILE 09 -  No field updated
  //
  it("TC-Profile09 - No changes in profile → System accepts and keeps old data", async () => {
    await browser.url("/profile");
    assert((await browser.getUrl()).includes("/profile"));

    await $(".edit-btn").click();

    await $('button[type="submit"]').click();

    await browser.waitUntil(
      async () => (await browser.getUrl()).includes("/profile"),
      { timeout: 5000, timeoutMsg: "Page did not reload to Profile" }
    );

    await browser.pause(1000);
  });
  //
  // TC-PROFILE 10 - Invalid avatar format → MSG045
  //
  it("TC-Profile10 - Invalid avatar format → MSG045", async () => {
    await browser.url("/profile");
    await $(".edit-btn").click();

    const oldAvatar = await $('img[alt="avatar"]').getAttribute("src");

    await browser.execute(() => {
      const el = document.getElementById("avatar-upload");
      el.removeAttribute("hidden");
      el.style.display = "block";
    });

    const filePath = path.join(process.cwd(), "test/resources/invalid.pdf");
    const remoteFilePath = await browser.uploadFile(filePath);

    const avatarInput = $("#avatar-upload");
    await avatarInput.setValue(remoteFilePath);

    const previewImg = $('img[alt="avatar"]');
    await browser.waitUntil(async () => await previewImg.isDisplayed(), {
      timeout: 3000,
      timeoutMsg: "Avatar preview not shown",
    });

    await $('button[type="submit"]').click();

    const errorMsg = $('//*[contains(text(),"Invalid image format")]');

    await browser.waitUntil(async () => await errorMsg.isDisplayed(), {
      timeout: 5000,
      timeoutMsg: "MSG045 - Invalid image format did not appear",
    });

    const newAvatar = await $('img[alt="avatar"]').getAttribute("src");
    assert.equal(
      newAvatar,
      oldAvatar,
      "Avatar should not be updated when uploading invalid file"
    );

    await browser.pause(1000);
  });
  //
  // TC-PROFILE 11 - Current password empty → MSG023
  //
  it("TC-Profile11 - Current password empty → MSG023", async () => {
    await browser.url("/profile");
    await $(".edit-btn").click();

    const changePasswordBtn = $(
      '//button[contains(text(), "Change Password")]'
    );
    await changePasswordBtn.click();

    const currentPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(1) > input[type=password] "
    );
    const newPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(2) > input[type=password] "
    );
    const confirmNewPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(3) > input[type=password] "
    );

    await currentPassword.setValue("");
    await newPassword.setValue("123456Bn#");
    await confirmNewPassword.setValue("123456Bn#");
    await $("button.save-btn").click();
    const errorMsg = $(
      '//*[contains(text(),"Current password can not be empty")]'
    );

    await browser.waitUntil(async () => await errorMsg.isDisplayed(), {
      timeout: 5000,
      timeoutMsg: "MSG023 - Current password can not be empty did not appear",
    });
    await browser.pause(1000);
  });
  //
  // TC-PROFILE 12 - New password empty → MSG025
  //
  it("TC-Profile12 - New password can not be empty → MSG025", async () => {
    await browser.url("/profile");
    await $(".edit-btn").click();

    const changePasswordBtn = $(
      '//button[contains(text(), "Change Password")]'
    );
    await changePasswordBtn.click();

    const currentPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(1) > input[type=password] "
    );
    const newPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(2) > input[type=password] "
    );
    const confirmNewPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(3) > input[type=password] "
    );

    await currentPassword.setValue("22022005Bn#");
    await newPassword.setValue("");
    await confirmNewPassword.setValue("123456Bn#");
    await $("button.save-btn").click();
    const errorMsg = $('//*[contains(text(),"New password can not be empty")]');

    await browser.waitUntil(async () => await errorMsg.isDisplayed(), {
      timeout: 5000,
      timeoutMsg: "MSG025 - New password can not be empty did not appear",
    });
    await browser.pause(1000);
  });
  //
  // TC-PROFILE 13 - Confirm new password empty → MSG026
  //
  it("TC-Profile13 - Confirm new password can not be empty → MSG026", async () => {
    await browser.url("/profile");
    await $(".edit-btn").click();

    const changePasswordBtn = $(
      '//button[contains(text(), "Change Password")]'
    );
    await changePasswordBtn.click();

    const currentPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(1) > input[type=password] "
    );
    const newPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(2) > input[type=password] "
    );
    const confirmNewPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(3) > input[type=password] "
    );

    await currentPassword.setValue("22022005Bn#");
    await newPassword.setValue("123456Bn#");
    await confirmNewPassword.setValue("");
    await $("button.save-btn").click();
    const errorMsg = $(
      '//*[contains(text(),"Confirm new password can not be empty")]'
    );

    await browser.waitUntil(async () => await errorMsg.isDisplayed(), {
      timeout: 5000,
      timeoutMsg:
        "MSG026 - Confirm new password can not be empty did not appear",
    });
    await browser.pause(1000);
  });
  //
  // TC-PROFILE 14 - Current password is incorrect → MSG027
  //
  it("TC-Profile14 - Current password is incorrect → MSG027", async () => {
    await browser.url("/profile");
    await $(".edit-btn").click();

    const changePasswordBtn = $(
      '//button[contains(text(), "Change Password")]'
    );
    await changePasswordBtn.click();

    const currentPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(1) > input[type=password] "
    );
    const newPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(2) > input[type=password] "
    );
    const confirmNewPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(3) > input[type=password] "
    );

    await currentPassword.setValue("Abc1234#");
    await newPassword.setValue("123456Bn#");
    await confirmNewPassword.setValue("123456Bn#");
    await $("button.save-btn").click();
    const errorMsg = $('//*[contains(text(),"Current password is incorrect")]');

    await browser.waitUntil(async () => await errorMsg.isDisplayed(), {
      timeout: 5000,
      timeoutMsg: "MSG027 - Current password is incorrect did not appear",
    });
    await browser.pause(1000);
  });
  //
  // TC-PROFILE 15 - New password does not meet policy → MSG006
  //
  it("TC-Profile15 - New password does not meet policy → MSG006", async () => {
    await browser.url("/profile");
    await $(".edit-btn").click();

    const changePasswordBtn = $(
      '//button[contains(text(), "Change Password")]'
    );
    await changePasswordBtn.click();

    const currentPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(1) > input[type=password] "
    );
    const newPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(2) > input[type=password] "
    );
    const confirmNewPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(3) > input[type=password] "
    );

    await currentPassword.setValue("22022005Bn#");
    await newPassword.setValue("123456");
    await confirmNewPassword.setValue("123456");
    await $("button.save-btn").click();
    const errorMsg = $(
      '//*[contains(text(),"Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character")]'
    );

    await browser.waitUntil(async () => await errorMsg.isDisplayed(), {
      timeout: 5000,
      timeoutMsg: "MSG006 did not appear",
    });
    await browser.pause(1000);
  });
  //
  // TC-PROFILE 16 - New password does not meet policy → MSG006
  //
  it("TC-Profile16 - New password does not meet policy → MSG006", async () => {
    await browser.url("/profile");
    await $(".edit-btn").click();

    const changePasswordBtn = $(
      '//button[contains(text(), "Change Password")]'
    );
    await changePasswordBtn.click();

    const currentPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(1) > input[type=password] "
    );
    const newPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(2) > input[type=password] "
    );
    const confirmNewPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(3) > input[type=password] "
    );

    await currentPassword.setValue("22022005Bn#");
    await newPassword.setValue("ABC1234@");
    await confirmNewPassword.setValue("ABC1234@");
    await $("button.save-btn").click();
    const errorMsg = $(
      '//*[contains(text(),"Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character")]'
    );

    await browser.waitUntil(async () => await errorMsg.isDisplayed(), {
      timeout: 5000,
      timeoutMsg: "MSG006 did not appear",
    });
    await browser.pause(1000);
  });
  //
  // TC-PROFILE 17 - New password does not meet policy → MSG006
  //
  it("TC-Profile17 - New password does not meet policy → MSG006", async () => {
    await browser.url("/profile");
    await $(".edit-btn").click();

    const changePasswordBtn = $(
      '//button[contains(text(), "Change Password")]'
    );
    await changePasswordBtn.click();

    const currentPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(1) > input[type=password] "
    );
    const newPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(2) > input[type=password] "
    );
    const confirmNewPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(3) > input[type=password] "
    );

    await currentPassword.setValue("22022005Bn#");
    await newPassword.setValue("abc1234@");
    await confirmNewPassword.setValue("abc1234@");
    await $("button.save-btn").click();
    const errorMsg = $(
      '//*[contains(text(),"Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character")]'
    );

    await browser.waitUntil(async () => await errorMsg.isDisplayed(), {
      timeout: 5000,
      timeoutMsg: "MSG006 did not appear",
    });
    await browser.pause(1000);
  });
  //
  // TC-PROFILE 18 - New password does not meet policy → MSG006
  //
  it("TC-Profile18 - New password does not meet policy → MSG006", async () => {
    await browser.url("/profile");
    await $(".edit-btn").click();

    const changePasswordBtn = $(
      '//button[contains(text(), "Change Password")]'
    );
    await changePasswordBtn.click();

    const currentPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(1) > input[type=password] "
    );
    const newPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(2) > input[type=password] "
    );
    const confirmNewPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(3) > input[type=password] "
    );

    await currentPassword.setValue("22022005Bn#");
    await newPassword.setValue("Abcdefg@");
    await confirmNewPassword.setValue("Abcdefg@");
    await $("button.save-btn").click();
    const errorMsg = $(
      '//*[contains(text(),"Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character")]'
    );

    await browser.waitUntil(async () => await errorMsg.isDisplayed(), {
      timeout: 5000,
      timeoutMsg: "MSG006 did not appear",
    });
    await browser.pause(1000);
  });
  //
  // TC-PROFILE 19 - New password does not meet policy → MSG006
  //
  it("TC-Profile19 - New password does not meet policy → MSG006", async () => {
    await browser.url("/profile");
    await $(".edit-btn").click();

    const changePasswordBtn = $(
      '//button[contains(text(), "Change Password")]'
    );
    await changePasswordBtn.click();

    const currentPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(1) > input[type=password] "
    );
    const newPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(2) > input[type=password] "
    );
    const confirmNewPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(3) > input[type=password] "
    );

    await currentPassword.setValue("22022005Bn#");
    await newPassword.setValue("Abc12345");
    await confirmNewPassword.setValue("Abc12345");
    await $("button.save-btn").click();
    const errorMsg = $(
      '//*[contains(text(),"Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character")]'
    );

    await browser.waitUntil(async () => await errorMsg.isDisplayed(), {
      timeout: 5000,
      timeoutMsg: "MSG006 did not appear",
    });
    await browser.pause(1000);
  });
  //
  // TC-PROFILE 20 -  New password equals old → MSG022
  //
  it("TC-Profile20 - New password equals old → MSG022", async () => {
    await browser.url("/profile");
    await $(".edit-btn").click();

    const changePasswordBtn = $(
      '//button[contains(text(), "Change Password")]'
    );
    await changePasswordBtn.click();

    const currentPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(1) > input[type=password] "
    );
    const newPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(2) > input[type=password] "
    );
    const confirmNewPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(3) > input[type=password] "
    );

    await currentPassword.setValue("22022005Bn#");
    await newPassword.setValue("22022005Bn#");
    await confirmNewPassword.setValue("22022005Bn#");
    await $("button.save-btn").click();
    const errorMsg = $(
      '//*[contains(text(),"New password must not match the old password")]'
    );

    await browser.waitUntil(async () => await errorMsg.isDisplayed(), {
      timeout: 5000,
      timeoutMsg: "MSG022 did not appear",
    });
    await browser.pause(1000);
  });
  //
  // TC-PROFILE 21 -  Password and Confirm Password do not match → MSG007
  //
  it("TC-Profile21 - Password and Confirm Password do not match → MSG007", async () => {
    await browser.url("/profile");
    await $(".edit-btn").click();

    const changePasswordBtn = $(
      '//button[contains(text(), "Change Password")]'
    );
    await changePasswordBtn.click();

    const currentPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(1) > input[type=password] "
    );
    const newPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(2) > input[type=password] "
    );
    const confirmNewPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(3) > input[type=password] "
    );

    await currentPassword.setValue("22022005Bn#");
    await newPassword.setValue("123456789Bn#");
    await confirmNewPassword.setValue("Abc1234@");
    await $("button.save-btn").click();
    const errorMsg = $(
      '//*[contains(text(),"Password and Confirm Password do not match")]'
    );

    await browser.waitUntil(async () => await errorMsg.isDisplayed(), {
      timeout: 5000,
      timeoutMsg: "MSG007 did not appear",
    });
    await browser.pause(1000);
  });
  //
  // TC-PROFILE 22 -  Full fields is empty →  MSG023, MSG026, MSG025
  //
  it("TC-Profile22 - Full fields is empty → MSG023, MSG026, MSG025", async () => {
    await browser.url("/profile");
    await $(".edit-btn").click();

    const changePasswordBtn = $(
      '//button[contains(text(), "Change Password")]'
    );
    await changePasswordBtn.click();

    const currentPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(1) > input[type=password]"
    );
    const newPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(2) > input[type=password]"
    );
    const confirmNewPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(3) > input[type=password]"
    );

    await currentPassword.setValue("");
    await newPassword.setValue("");
    await confirmNewPassword.setValue("");
    await $("button.save-btn").click();

    const msg023 = $(
      '//*[contains(text(),"Current password can not be empty")]'
    );
    const msg025 = $('//*[contains(text(),"New password can not be empty")]');
    const msg026 = $(
      '//*[contains(text(),"Confirm new password can not be empty")]'
    );

    await browser.waitUntil(
      async () =>
        (await msg023.isDisplayed()) &&
        (await msg025.isDisplayed()) &&
        (await msg026.isDisplayed()),
      {
        timeout: 5000,
        timeoutMsg: "MSG023, MSG025, MSG026 did not appear",
      }
    );

    await browser.pause(1000);
  });
  //
  // TC-PROFILE 23 - Password changes successfully
  //
  it("TC-Profile23 - Password changes successfully", async () => {
    await browser.url("/profile");
    await $(".edit-btn").click();

    const changePasswordBtn = $(
      '//button[contains(text(), "Change Password")]'
    );
    await changePasswordBtn.click();

    const currentPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(1) > input[type=password] "
    );
    const newPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(2) > input[type=password] "
    );
    const confirmNewPassword = $(
      "#root > div > div.page-content > div > div > div.tab-content > form > div.form-grid > div:nth-child(3) > input[type=password] "
    );

    await currentPassword.setValue("22022005Bn#");
    await newPassword.setValue("123456789Bn#");
    await confirmNewPassword.setValue("123456789Bn#");
    await $("button.save-btn").click();

    // 1. Logout
    await browser.url("/logout");

    // 2. Login bằng mật khẩu mới
    await browser.url("/login");
    await $("#email").setValue("23521019@gm.uit.edu.vn");
    await $("#password").setValue("123456789Bn#");
    await $('button[type="submit"]').click();

    await browser.waitUntil(
      async () => (await browser.getUrl()).includes("/home"),
      {
        timeout: 5000,
        timeoutMsg:
          "Password change failed - login with new password unsuccessful",
      }
    );

    await browser.pause(1000);
  });
});
