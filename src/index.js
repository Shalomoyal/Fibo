async function check_repo_empty(url) {
    try {
        let newURL = 'https://api.github.com/repos/'.concat(url.split('/')[4], '/', url.split('/')[5]);
        const response = await fetch(newURL).then((res) => res.json());

        if (response.message === "Not Found"){
          document.getElementById("demo").innerHTML += "Error: The Repository is not found";
        }
        else{            
            document.getElementById("demo").innerHTML += "The Repository is Empty";
        }

        return response.message;
      } catch (error) {
        console.log(error);
      }
}

async function get_data(url, level) {
  try {
    const list = await fetch(url).then((res) => res.json());

    if (list.message === "Not Found") {
        await check_repo_empty(url);        
    }

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
    await get_data(folder.node.url, (level += "   "));
  } else {
    print_node(node.path, level);
  }
}

function print_node(name, level) {
    let string = level + "- " + name + "<br />";
    console.log(string);
    document.getElementById("demo").innerHTML += string;
}

async function check_validation(user, repo) {
  let message = "";

  if (!user) {
    message += "Please enter user name. ";    
  }

  if (!repo) {
    message += "Please enter repository. ";
  }

  document.getElementById("demo").innerHTML += message;
  return message;
}

async function main() {
  let user = document.getElementById('txtUser').value;
  let repo = document.getElementById('txtRepo').value;

  let checkValid = await check_validation(user, repo);

  if (!checkValid){
    await get_data(
        `https://api.github.com/repos/${user}/${repo}/git/trees/master`,
        ""
    );
  }
}

function onClick(){
  document.getElementById("demo").innerHTML = "";
  main();
}
