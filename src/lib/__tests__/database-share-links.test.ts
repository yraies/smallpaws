describe("database share links", () => {
  const originalDataDir = process.env.DATA_DIR;

  afterEach(() => {
    jest.resetModules();

    if (originalDataDir === undefined) {
      delete process.env.DATA_DIR;
    } else {
      process.env.DATA_DIR = originalDataDir;
    }
  });

  test("forms keep one canonical share link", async () => {
    process.env.DATA_DIR = `/tmp/garden-walk-test-form-share-${Date.now()}-${Math.random()}`;

    const { FormStorage } = await import("../database");

    FormStorage.saveForm({
      id: "form_test_single_share",
      modification_key: "mod-key",
      encrypted: false,
      name: "Form",
      data: JSON.stringify({ name: "Form" }),
    });

    const firstShare = FormStorage.upsertSharedForm({
      shareId: "share_first",
      formId: "form_test_single_share",
      expiresAt: null,
    });

    const secondShare = FormStorage.upsertSharedForm({
      shareId: "share_second",
      formId: "form_test_single_share",
      expiresAt: "2030-01-01T00:00:00.000Z",
    });

    const canonicalShare = FormStorage.getCanonicalSharedFormForForm(
      "form_test_single_share",
    );

    expect(secondShare.share_id).toBe(firstShare.share_id);
    expect(canonicalShare?.share_id).toBe(firstShare.share_id);
    expect(canonicalShare?.expires_at).toBe("2030-01-01T00:00:00.000Z");
    expect(
      FormStorage.getSharedFormsForForm("form_test_single_share"),
    ).toHaveLength(1);

    FormStorage.deleteCanonicalSharedFormForForm("form_test_single_share");
    expect(
      FormStorage.getCanonicalSharedFormForForm("form_test_single_share"),
    ).toBeNull();
  });

  test("expired auto-delete share marks underlying form deleted", async () => {
    process.env.DATA_DIR = `/tmp/garden-walk-test-form-autodelete-${Date.now()}-${Math.random()}`;

    const { FormStorage } = await import("../database");

    FormStorage.saveForm({
      id: "form_test_autodelete",
      modification_key: "mod-key",
      encrypted: false,
      name: "Form",
      data: JSON.stringify({ name: "Form" }),
    });

    FormStorage.upsertSharedForm({
      shareId: "share_autodelete",
      formId: "form_test_autodelete",
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
    });

    const deletedForm = FormStorage.getForm("form_test_autodelete");

    expect(deletedForm).toMatchObject({
      id: "form_test_autodelete",
      name: "[Deleted]",
      data: "{}",
    });
  });

  test("templates keep one canonical share link", async () => {
    process.env.DATA_DIR = `/tmp/garden-walk-test-template-share-${Date.now()}-${Math.random()}`;

    const { TemplateStorage } = await import("../database");

    TemplateStorage.saveTemplate({
      id: "template_test_single_share",
      encrypted: false,
      name: "Template",
      data: JSON.stringify({ name: "Template" }),
    });

    const firstShare = TemplateStorage.upsertSharedTemplate(
      "template_test_single_share",
      "share_first",
    );

    const secondShare = TemplateStorage.upsertSharedTemplate(
      "template_test_single_share",
      "share_second",
    );

    const canonicalShare =
      TemplateStorage.getCanonicalSharedTemplateForTemplate(
        "template_test_single_share",
      );

    expect(secondShare.share_id).toBe(firstShare.share_id);
    expect(canonicalShare?.share_id).toBe(firstShare.share_id);
    expect(
      TemplateStorage.getSharedTemplatesForTemplate(
        "template_test_single_share",
      ),
    ).toHaveLength(1);

    TemplateStorage.deleteCanonicalSharedTemplateForTemplate(
      "template_test_single_share",
    );
    expect(
      TemplateStorage.getCanonicalSharedTemplateForTemplate(
        "template_test_single_share",
      ),
    ).toBeNull();
  });
});
