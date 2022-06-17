class ShefAlreadyExistsError(Exception):
    def __init__(self, name: str) -> None:
        super().__init__(f"Shef '{name}' already exists")
        self.name = name
