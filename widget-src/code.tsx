const { widget } = figma;
const { useSyncedState, AutoLayout, Text, Image, Frame, useSyncedMap } = widget;

function Button({
  text,
  textSize = 12,
  onClick,
}: {
  text: string;
  textSize?: number;
  onClick: () => void;
}) {
  return (
    <AutoLayout
      stroke="#2a2a2a"
      strokeWidth={1}
      cornerRadius={100}
      padding={10}
      spacing={10}
      onClick={onClick}
    >
      <Text fill="#2a2a2a" fontSize={textSize}>
        {text}
      </Text>
    </AutoLayout>
  );
}

function TeammatePhotoBubble({
  figmaUser,
  isActive = false,
}: {
  figmaUser: User;
  isActive?: boolean;
}) {
  const { photoUrl, name } = figmaUser;
  const diameter = isActive ? 50 : 30;
  const textWidth = isActive ? undefined : 80;
  const fontSize = isActive ? 16 : 12;

  return (
    <AutoLayout
      direction="horizontal"
      horizontalAlignItems="start"
      verticalAlignItems="center"
      spacing={12}
      width="fill-parent"
    >
      <AutoLayout stroke="#2a2a2a" cornerRadius={100}>
        {photoUrl ? (
          <Image
            cornerRadius={6}
            width={diameter}
            height={diameter}
            src={photoUrl}
          />
        ) : (
          <Frame
            cornerRadius={6}
            width={diameter}
            height={diameter}
            fill="#2A2A2A"
          />
        )}
      </AutoLayout>
      {/* TODO: handle really long names / text resizing */}
      <AutoLayout width="fill-parent">
        <Text fontSize={fontSize} width="fill-parent">
          {isActive ? `${name}, it's your turn!` : name}
        </Text>
      </AutoLayout>
    </AutoLayout>
  );
}

function isUserInMap(userMap: SyncedMap<User>, user: User): boolean {
  for (const existingUser of userMap.values()) {
    if (existingUser.id === user.id) {
      return true;
    }
  }
  return false;
}

function parseAndSortKeys(map: SyncedMap<any>) {
  const parsedKeys = Array.from(map.keys(), parseFloat).filter(
    (key) => !isNaN(key)
  );
  parsedKeys.sort((a, b) => a - b);
  return parsedKeys.map((key) => key.toString());
}

function TeammatePhotoBubbleRow({
  user1 = undefined,
  user2 = undefined,
  user3 = undefined,
}: {
  key?: any;
  user1?: User | undefined;
  user2?: User | undefined;
  user3?: User | undefined;
}) {
  return (
    <AutoLayout
      direction={"horizontal"}
      // verticalAlignItems="center"
      // horizontalAlignItems="center"
      spacing={30}
      padding={{ bottom: 10, top: 10 }}
      width={"fill-parent"}
    >
      {user1 ? (
        <TeammatePhotoBubble figmaUser={user1} />
      ) : (
        <AutoLayout width="fill-parent" height={1} />
      )}
      {user2 ? (
        <TeammatePhotoBubble figmaUser={user2} />
      ) : (
        <AutoLayout width="fill-parent" height={1} />
      )}
      {user3 ? (
        <TeammatePhotoBubble figmaUser={user3} />
      ) : (
        <AutoLayout width="fill-parent" height={1} />
      )}
    </AutoLayout>
  );
}

function Widget() {
  const displayOrder = useSyncedMap<User>("displayOrder");
  const userIdToUser = useSyncedMap("idToUser");

  const debugMode = false;

  const addUserToDisplay = () => {
    const currentUser = figma.currentUser;
    if (!currentUser) {
      return;
    }

    // if not in debug mode, only allow adding yourself to the queue once
    if (!debugMode && isUserInMap(displayOrder, currentUser)) {
      return;
    }

    const largestKey = Math.max(...displayOrder.keys().map(parseFloat), 0);
    const nextKey = largestKey + 1;

    displayOrder.set(nextKey.toString(), currentUser);
  };

  const removeUserFromDisplay = () => {
    const smallestKey = Math.min(...displayOrder.keys().map(parseFloat));
    displayOrder.delete(smallestKey.toString());
  };

  const renderTeammatePhotoBubbles = (syncedMap: SyncedMap<User>) => {
    const sortedKeys = parseAndSortKeys(syncedMap);

    // skip the first user because we'll render them separately
    let isFirstUser = true;

    return sortedKeys.map((key) => {
      const user = displayOrder.get(key);

      if (user) {
        if (isFirstUser) {
          isFirstUser = false; // Mark the first user as visited
          return null; // Skip the first user
        }

        return <TeammatePhotoBubble key={key} figmaUser={user} />;
      }

      return null;
    });
  };

  const getFirstUserKey = (syncedMap: SyncedMap<User>) => {
    const smallestKey = Math.min(...displayOrder.keys().map(parseFloat));
    return smallestKey.toString();
  };

  const getWaitingUsers = (syncedMap: SyncedMap<User>) => {
    const smallestKey = Math.min(...displayOrder.keys().map(parseFloat));
    const largestKey = Math.max(...displayOrder.keys().map(parseFloat), 0);
    let nextKey = smallestKey + 1;

    let userArray: Array<User> = [];

    // Iterate through the Map starting from the second element
    let isFirstElement = true;
    for (const [key, user] of displayOrder.entries()) {
      if (!isFirstElement) {
        userArray.push(user);
      } else {
        isFirstElement = false;
      }
    }

    return userArray;
  };

  return (
    <AutoLayout
      direction="vertical"
      fill="#FFFFFF"
      stroke="#E6E6E6"
      width={500}
      minHeight={220}
      spacing={20}
      cornerRadius={10}
      padding={{ top: 40, left: 20, right: 20, bottom: 40 }}
    >
      {/* Empty state */}
      {displayOrder.size < 1 && (
        <AutoLayout height={85} verticalAlignItems="center">
          <Text>{`Click the button to add yourself to the list.`}</Text>
        </AutoLayout>
      )}
      {/* There's someone whose turn it is */}
      {displayOrder.size > 0 && (
        <AutoLayout
          direction="horizontal"
          spacing={20}
          horizontalAlignItems="center"
          verticalAlignItems="center"
          width={"fill-parent"}
        >
          <TeammatePhotoBubble
            key={getFirstUserKey(displayOrder)}
            figmaUser={displayOrder.get(getFirstUserKey(displayOrder))!}
            isActive={true}
          />
          {displayOrder.size > 0 ? (
            <Button text="Next" onClick={removeUserFromDisplay} />
          ) : (
            <></>
          )}
        </AutoLayout>
      )}
      {displayOrder.size === 1 && (
        <AutoLayout direction="vertical">
          <Text
            fontSize={12}
          >{`Click the button to add yourself to the list.`}</Text>
        </AutoLayout>
      )}
      {/* People waiting in line */}
      {displayOrder.size > 1 && (
        <AutoLayout spacing={10} width={"fill-parent"} direction="vertical">
          <AutoLayout direction="vertical" spacing={20}>
            <Text>{`Who's up next?`}</Text>
          </AutoLayout>

          <AutoLayout direction={"vertical"} width={"fill-parent"}>
            {getWaitingUsers(displayOrder).map((user, idx, users) => {
              if (idx % 3 != 0) {
                return null;
              }
              return (
                <TeammatePhotoBubbleRow
                  key={idx}
                  user1={users[idx]}
                  user2={users[idx + 1]}
                  user3={users[idx + 2]}
                />
              );
            })}
          </AutoLayout>
        </AutoLayout>
      )}

      {/* Button to join list */}
      <AutoLayout>
        <Button text="Join the list" onClick={addUserToDisplay} />
      </AutoLayout>
    </AutoLayout>
  );
}

widget.register(Widget);
