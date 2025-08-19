Contributing to this project is designed to be straightforward and consistent. We use automated tools to maintain code quality and a clear commit history.

***

### Getting Started 🚀

1.  **Create a new Issue:** Start by creating a new issue to discuss the feature or bug you want to fix. This helps ensure that your work aligns with the project's goals.
2.  **Fork and Clone:** Fork the repository on GitHub, then clone your fork to your local machine.
3.  **Install Dependencies:** Run `npm install` to set up all the necessary tools and packages, including Biome and Lefthook.

***

### Development Workflow 🛠️

1.  **Branching:** Create a new branch for your changes. Use a clear, descriptive name like `feat/your-feature-name` or `fix/issue-number`.

2.  **Make Changes:** Write your code. Our pre-commit hooks will automatically format and lint your files using **Biome** when you commit. If Biome finds any issues it can't fix, it will let you know so you can resolve them.

3.  **Commit:** Use a descriptive commit message that follows the [Conventional Commits](https://www.conventionalcommits.org/) standard. For example, `feat: add new feature`. This ensures a clean and readable Git history.

4.  **Create a Pull Request:** After you've committed your changes, push your branch to your forked repository and open a new Pull Request. Link your PR to the issue you created in step 1. This allows us to track progress and discussion.

### Our Tools

* **Biome**: Our all-in-one formatter and linter. It keeps the code style consistent without you having to think about it.
* **Lefthook**: Manages our Git hooks, running Biome and Commitlint automatically before you can commit.
* **Commitlint**: Enforces the conventional commit message format to maintain a clear and organized history.