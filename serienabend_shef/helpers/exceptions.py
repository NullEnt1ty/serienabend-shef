class ChefAlreadyExistsError(Exception):
    def __init__(self, name: str) -> None:
        super().__init__(f"Chef '{name}' already exists")
        self.name = name
