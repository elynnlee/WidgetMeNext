const { widget } = figma;
const { useSyncedState, AutoLayout, Text, Image, Frame, useSyncedMap } = widget;

function Button({
  text,
  textSize = 14,
  onClick,
}: {
  text: string;
  textSize?: number;
  onClick: () => void;
}) {
  return (
    <AutoLayout
      stroke="#2a2a2a"
      strokeWidth={2}
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
  const fontSize = isActive ? 20 : 12;

  return (
    <AutoLayout
      direction="horizontal"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      spacing={12}
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
      <Text width={textWidth} horizontalAlignText="left" fontSize={fontSize}>
        {isActive ? `${name}, it's your turn!` : name}
      </Text>
    </AutoLayout>
  );
}

function parseAndSortKeys(map: SyncedMap<any>) {
  const parsedKeys = Array.from(map.keys(), parseFloat).filter(
    (key) => !isNaN(key)
  );
  parsedKeys.sort((a, b) => a - b);
  return parsedKeys.map((key) => key.toString());
}

function Widget() {
  const [users, setUsers] = useSyncedState("users", []);
  const [activeTeammate, setActive] = useSyncedState("activeTeammate", null);
  const displayOrder = useSyncedMap("displayOrder");
  const userIdToUser = useSyncedMap("idToUser");

  const addUserToDisplay = () => {
    const currentUser = figma.currentUser;
    if (!currentUser) {
      return;
    }

    const largestKey = Math.max(...displayOrder.keys().map(parseFloat), 0);
    const nextKey = largestKey + 1;

    displayOrder.set(nextKey.toString(), currentUser);
  };

  const renderTeammatePhotoBubbles = () => {
    const sortedKeys = parseAndSortKeys(displayOrder);

    return sortedKeys.map((key) => {
      const user = displayOrder.get(key);

      if (user) {
        console.log(user.name);
        return <TeammatePhotoBubble key={key} figmaUser={user} />;
      }

      return null;
    });
  };

  return (
    <AutoLayout
      direction="vertical"
      fill="#FFFFFF"
      stroke="#E6E6E6"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      spacing={20}
      cornerRadius={10}
      padding={{ top: 40, left: 20, right: 20, bottom: 40 }}
    >
      <AutoLayout
        direction="vertical"
        spacing={20}
        horizontalAlignItems="center"
        padding={{ top: 0, left: 0, right: 0, bottom: 15 }}
      >
        <Button text="Add me" onClick={addUserToDisplay} />
      </AutoLayout>
      <AutoLayout direction="vertical" spacing={20}>
        {renderTeammatePhotoBubbles()}
      </AutoLayout>
    </AutoLayout>
  );
}

widget.register(Widget);
