async function check_repo_exist(url) {
  try {
    const response = await fetch(url).then((res) => res.json());
    return response.message;
  } catch (error) {
    console.log(error);
  }
}

async function get_data(url, level) {
  try {
    const list = await fetch(url).then((res) => res.json());

    if (level !== undefined) {
      for (const i in list.tree) {
        await check_type_node(list.tree[i], level);
      }
    }

    return list.tree;
  } catch (error) {
    console.log(error);
  }
}

async function check_only_folder(node) {
  let previousNode = node;
  let newPath = node.path;

  let children = await get_data(node.url);

  while (children.length === 1 && children[0].type === "tree") {
    newPath += "/".concat(children[0].path);
    previousNode = children[0];
    children = await get_data(children[0].url);
  }

  return { path: newPath, node: previousNode };
}

async function check_type_node(node, level) {
  if (node.type === "tree") {
    let folder = await check_only_folder(node);
    print_node(folder.path, level);
    await get_data(folder.node.url, (level += "  "));
  } else {
    print_node(node.path, level);
  }
}

function print_node(name, level) {
  console.log(level + "- " + name);
}

async function check_validation(user, repo) {
  let message = "";

  if (!user) {
    message += "Please enter user name. ";
  }

  if (!repo) {
    message += "Please enter repository. ";
  }

  if (message.length > 0) {
    alert(message);
  } else {
    const urlCheck = `https://api.github.com/repos/${user}/${repo}/git/trees/master`;
    const flag_repo_exist = await check_repo_exist(urlCheck);
    if (flag_repo_exist === "Not Found") {
      alert("Not Found");
    } else {
      alert(flag_repo_exist);
    }
  }
}

async function main() {
  let user = "githubtraining";
  let repo = "hellogitworld";

  await check_validation(user, repo);

  await get_data(
    `https://api.github.com/repos/${user}/${repo}/git/trees/master`,
    ""
  );
}

main();