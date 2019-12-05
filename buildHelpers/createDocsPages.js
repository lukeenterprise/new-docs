const path = require("path");
const { defaultLocale } = require("./i18n");
const { buildPathFromFile } = require("./routes");

const REFERENCE_ROOT = "src/api";
const DOCS_ROOT = "src/docs";
const isReference = (doc) => doc.relativeDirectory.includes(REFERENCE_ROOT);

const createDocsPages = ({ actions, docs }) => {
  // TODO: These pages don't support internationalization. This should be
  // refactored so that it can use createI18nPages.
  const docTemplate = path.resolve(".", "src", "templates", "Documentation.js");
  const apiTemplate = path.resolve(".", "src", "templates", "ApiReference.js");

  const allDocs = docs.map(({ node }) => node);

  const apiReference = allDocs.filter((doc) => isReference(doc));
  const documentation = allDocs.filter((doc) => !isReference(doc));

  documentation.forEach((doc) => {
    const docPath =
      doc.relativeDirectory === DOCS_ROOT ? "/docs/" : buildPathFromFile(doc);
    actions.createPage({
      path: docPath,
      component: docTemplate,
      context: {
        urlPath: docPath,
        locale: defaultLocale,
        relativeDirectory: doc.relativeDirectory,
        relativePath: doc.relativePath,
        rootDir: DOCS_ROOT,
        // None of these have translations set up. If we translate them in
        // the future, we'll have to revisit this.
      },
    });
  });
  actions.createPage({
    path: "docs/api",
    matchPath: "docs/api/*",
    component: apiTemplate,
    context: {
      urlPath: "docs/api",
      ids: apiReference.map(({ childMdx }) => childMdx.id),
      locale: defaultLocale,
    },
  });
};

const queryFragment = `
  docs: allFile(filter: {
    sourceInstanceName: { eq: "docs" },
    extension: { eq: "mdx" }
  }) {
    edges {
      node {
        childMdx {
          id
        }
        relativePath
        relativeDirectory
        fields {
          metadata {
            data {
              order
              title
            }
          }
        }
      }
    }
  }
`;

exports.createDocsPages = createDocsPages;
exports.queryFragment = queryFragment;
exports.buildPathFromFile = buildPathFromFile;
