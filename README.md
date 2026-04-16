# wccn

## 1. Layout

```dot
digraph MainPageLayout {
  rankdir=TB;
  node [shape=box, style="rounded,filled", fillcolor="#E8F0FE"];

  Header [label="Header\n(Logo | Navigation)"];
  Footer [label="Footer\n(Copyright | Links)"];

  subgraph cluster_main {
    label="Main Area";
    style="rounded,dashed";
    color="#999999";

    Sidebar [label="Sidebar\n(Menu | Filters)", fillcolor="#FFF4E5"];
    Content [label="Content\n(Articles | Dashboard)", fillcolor="#E6FFFA"];

    Sidebar -> Content [dir=none];
  }

  Header -> Sidebar;
  Header -> Content;
  Sidebar -> Footer;
  Content -> Footer;
}
```

## 2. title page

```dot
digraph TableLayout {
  size="6,8!";
  ratio=compress;
    rankdir=TB;
  node [shape=box];

  subgraph cluster_row1 {
    label="header";
    Header [width=12];
  }

  subgraph cluster_row2 {

    subgraph cluster_content {

        content1 [label="title id bar", width=12];
    }
    subgraph cluster_content {
        subgraph cluster_titleEditor {
            content2_1 [label="menu", width=12];
            subgraph cluster_content2_2 {
                content2_2_1 [label="path, title, tags", width=12];
                content2_2_2 [label="paragraphs", width=12];
            }
            content2_3 [label="save", width=12];

        }
        content2_1 -> content2_2_1 -> content2_2_2 -> content2_3 [style=invis]
    }
    content1 -> content2_1 [style=invis]
    
    spacer1 [label="", width=12, height=0, fixedsize=true, style=invis];
    spacer2 [label="", width=12, height=0, fixedsize=true, style=invis];
    spacer1 -> content1 [style=invis]
    content2_3 -> spacer2 [style=invis]
  }

  subgraph cluster_row3 {
    label="footer";

    Footer [width=12];
  }

  Header -> spacer1 [style=invis];
  spacer2 -> Footer [style=invis];
}
```

```dot
digraph Grid {
  node [shape=box, width=2];

  { rank=same; Header }
  { rank=same; Sidebar Content }
  { rank=same; Footer }

  Header -> Sidebar [style=invis];
  Sidebar -> Content [style=invis];
  Content -> Footer [style=invis];
}
```

## .dot guidle

padding, margin
align node: A -> B [style=invis]

### layout

  layout=neato;
  rankdir=TB;
  subgraph cluster_ {}

### resize graph to fit

  size="6,8!";
  ratio=compress;

## optimize

### One login - both firebase and docs API

|Service|Auth|
|-|-|
|Firestore|Firebase Auth (Google provider)|
|Docs API|Same Google account OAuth token|

Flow:

- User signs in with Google (Firebase Auth)
- Firebase gives:
  - Firebase ID token (Firestore)
  - Google OAuth access token (Docs API)
- Use:
  - Firestore SDK normally
  - gapi.client.docs with OAuth token

? One login
? Same user
? Secure
? Supported

? React example (Firebase Auth)

```js
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/documents");

const result = await signInWithPopup(auth, provider);

// Google OAuth token
const accessToken = GoogleAuthProvider.credentialFromResult(result)
  .accessToken;
```

Use token for Docs API:

```js
gapi.client.setToken({ access_token: accessToken });
```

## content

```plantuml
@startuml
title Component Diagram - Asset & Firebase Interaction

package "Client Side" {
    [Client App] as Client
}

package "Server Side" {
    [Asset] as Asset
}

database "Firebase" as Firebase

Client --> Asset : get {key info}
Client --> Firebase : get {title}

@enduml
```

## export keys

```python
os.makedirs(os.path.join(tmp_dir, 'keys'), exist_ok=True)
for key in result:
    with open(f"{tmp_dir}/keys/{key['id']}.json", "w", encoding="utf-8") as f:
        json.dump(key, f, indent=2, ensure_ascii=False)
```

## env

VITE_TITLE=app-name
VITE_API=''
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_GOOGLE_CLIENT_ID=
VITE_USE_EMU=yes/no
