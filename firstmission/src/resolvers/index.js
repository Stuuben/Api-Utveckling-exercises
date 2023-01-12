const path = require("path");
const fsPromises = require("fs/promises");
const { fileExists, readJsonFile } = require("../utils/fileHandling");
const { GraphQLError, graphql } = require("graphql");
const crypto = require("node:crypto");
const { truncate } = require("fs");

const projectDirectory = path.join(__dirname, "..", "data", "project");

exports.resolvers = {
  Query: {
    getTodoById: async (_, args) => {
      const todoId = args.projectId;
      // `../data/projects/${projectId}.json`
      const todoFilePath = path.join(
        __dirname,
        `../data/projects/${todoId}.json`
      );

      const todoExists = await fileExists(todoFilePath);
      if (!todoExists) return new GraphQLError("That project does not exist");

      const todoData = await fsPromises.readFile(todoFilePath, {
        encoding: "utf-8",
      });
      const data = JSON.parse(todoData);
      return data;
    },
    getAllProjects: async (_, args) => {
      // hämta mockdata
      const todoDirectory = path.join(__dirname, "../data/projects");
      const projects = await fsPromises.readdir(todoDirectory);

      const promises = [];
      // loopa
      projects.forEach((fileName) => {
        const filePath = path.join(todoDirectory, fileName);
        promises.push(readJsonFile(filePath));
      });
      const todoData = await Promise.all(promises);
      return todoData;
    },
  },
  Mutation: {
    createTodo: async (_, args) => {
      // Verify name
      if (args.name.length === 0)
        return new GraphQLError("Name must be at least 1 character long");

      // Skapa ett unikt id + data objektet
      const newTodo = {
        id: crypto.randomUUID(),
        name: args.name,
        description: args.description || "",
      };

      let filePath = path.join(
        __dirname,
        "..",
        "data",
        "projects",
        `${newTodo.id}.json`
      );

      let idExists = true;
      while (idExists) {
        const exists = await fileExists(filePath);
        console.log(exists, newTodo.id);
        if (exists) {
          newTodo.id = crypto.randomUUID();
          filePath = path.join(
            __dirname,
            "..",
            "data",
            "projects",
            `${newTodo.id}.json`
          );
        }
        idExists = exists;
      }

      // Skapa en fil för projektet i /data/projects
      await fsPromises.writeFile(filePath, JSON.stringify(newTodo));

      // Skapa våran respons
      return newTodo;
    },
    updateTodo: async (_, args, context) => {
      // hämta alla parametrar från args
      /*       const todotId = args.id;
      const todoName = args.name;
      const todoId = args.description; */

      const { id, name, description } = args;

      let filePath = path.join(
        __dirname,
        "..",
        "data",
        "projects",
        `${id}.json`
      );

      // finns det projekt som de vill ändra
      // if (no) return Not Found Error
      const exists = await fileExists(filePath);
      if (!todoExists) return new GraphQLError("That project does not exist");

      // skapa updatedProject objekt
      const updatedTodo = {
        id,
        name,
        description,
      };
      // skriv över den gamla filen med nya infon
      await fsPromises.writeFile(filePath, JSON.stringify(updatedTodo));
      // return updatedProject

      return updatedTodo;
    },
    deleteTodo: async (_, args, context) => {
      // get project ut
      const todoId = args.projectId;

      const filePath = path.join(
        __dirname,
        "..",
        "data",
        "projects",
        `${todoId.id}.json`
      );

      // does this project exists?
      // if no ( return error)
      const todoExists = await fileExists(filePath);
      if (!todoExists) return new GraphQLError("That project does not exist");

      // delete file
      try {
        await fsPromises.unlink(filePath);
      } catch (error) {
        return {
          deletedId: todoId,
          success: false,
        };
      }

      return {
        deletedId: todoId,
        success: true,
      };
    },
  },
};
