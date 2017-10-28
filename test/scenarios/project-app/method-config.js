// ---------------------------------
// Methods for scenario: project-app
// (method-config)
// ---------------------------------
import user from './resources/user';
import userInfo from './resources/user-info';
import project from './resources/project';
import projectContributor from './resources/project-contributor';
import codingLanguageTag from './resources/coding-language-tag';
import softwareTag from './resources/software-tag';
import techConceptTag from './resources/tech-concept-tag';

module.exports = {
  resources: [
    user,
    userInfo,
    project,
    projectContributor,
    codingLanguageTag,
    softwareTag,
    techConceptTag,
  ],
};
