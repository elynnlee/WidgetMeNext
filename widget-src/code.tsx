// This is a counter widget with buttons to increment and decrement the number.

const { widget } = figma;
const {
  useSyncedState,
  usePropertyMenu,
  AutoLayout,
  Text,
  SVG,
  Image,
  Frame,
  useSyncedMap,
} = widget;

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
      stroke={"#2a2a2a"}
      strokeWidth={2}
      cornerRadius={100}
      padding={10}
      spacing={10}
      onClick={onClick}
    >
      <Text fill={"#2a2a2a"} fontSize={textSize}>
        {text}
      </Text>
    </AutoLayout>
  );
}

function TeammatePhotoBubble({
  figmaUser,
  isActive = false,
  onUserSelected = undefined,
}: {
  figmaUser: User;
  isActive?: boolean;
  onUserSelected?: (user: User) => void;
}) {
  const photoUrl = figmaUser.photoUrl;
  const teammateName = figmaUser.name;
  const diameter = isActive ? 50 : 30;
  const textWidth = isActive ? undefined : 80;
  const fontSize = isActive ? 20 : 12;
  return (
    <AutoLayout
      direction={"horizontal"}
      horizontalAlignItems="center"
      verticalAlignItems="center"
      spacing={12}
    >
      <AutoLayout stroke={"#2a2a2a"} cornerRadius={100}>
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
      <Text width={textWidth} horizontalAlignText={"left"} fontSize={fontSize}>
        {isActive ? `${teammateName}, it's your turn!` : teammateName}
      </Text>
    </AutoLayout>
  );
}

function Widget() {
  const [activeTeammate, setActive] = useSyncedState<User | null>(
    "activeTeammate",
    null
  );

  // order to display users
  const userIdToDisplayOrder = useSyncedMap<number>("displayOrder");

  const addUserToDisplay = () => {
    // update map + say this person has gone
    // userIdToDisplayOrder.set(user.id, userIdToDisplayOrder.size + 1);
    console.log("hello");
    const currentUser = figma.currentUser;
    if (currentUser) {
      console.log(currentUser.id);
    }
  };

  return (
    <AutoLayout
      direction={"vertical"}
      fill={"#FFFFFF"}
      stroke={"#E6E6E6"}
      horizontalAlignItems={"center"}
      verticalAlignItems={"center"}
      spacing={20}
      cornerRadius={10}
      padding={{ top: 40, left: 20, right: 20, bottom: 40 }}
    >
      <AutoLayout
        direction="vertical"
        spacing={20}
        horizontalAlignItems={"center"}
        padding={{ top: 0, left: 0, right: 0, bottom: 15 }}
      >
        <Button
          text={"Next (random)"}
          onClick={() => {
            addUserToDisplay();
          }}
        />
      </AutoLayout>
    </AutoLayout>
  );
}

widget.register(Widget);
