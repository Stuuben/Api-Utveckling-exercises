const path = require("path");
const fsPromises = require("fs/promises");
const { fileExists, readJsonFile } = require("../utils/fileHandling");
const { GraphQLError } = require("graphql");

exports.resolvers = {
  Query: {
    getProjectById: async (_, args) => {
      const projectId = args.projectId;
      // `../data/projects/${projectId}.json`
      const projectFilePath = path.join(
        __dirname,
        `../data/projects/${projectId}.json`
      );

      const projectExists = await fileExists(projectFilePath);
      if (!projectExists)
        return new GraphQLError("That project does not exist");

      const projectData = await fsPromises.readFile(projectFilePath, {
        encoding: "utf-8",
      });
      const data = JSON.parse(projectData);
      return data;
    },
    getAllProjects: async (_, args) => {
      const projectDirectory = path.join(__dirname, "../data/projects");
      const projects = await fsPromises.readdir(projectDirectory);

      const promises = [];
      projects.forEach((fileName) => {
        const filePath = path.join(projectDirectory, fileName);
        promises.push(readJsonFile(filePath));
      });
      const projectData = await Promise.all(promises);
      return projectData;
    },
  },
  Mutation: {
    createProject: (_, args, context) => {
      return message;
    },
    updateProject: (_, args, context) => {
      return message;
    },
    deleteProject: (_, args, context) => {
      return message;
    },
  },
};
