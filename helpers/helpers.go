package helpers

import (
	"context"
	"errors"

	"github.com/raihan2bd/go-todo-with-mongodb/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var ctx = context.TODO()

// Fetch todos form database
func FetchTodosFormDB(db *mongo.Collection) ([]models.Todo, error) {
	// var todoM Todo
	var todos []models.TodoModel
	todoList := []models.Todo{}
	cur, err := db.Find(ctx, bson.D{})
	if err != nil {
		defer cur.Close(ctx)
		return todoList, errors.New("failed to fetch todo")
	}

	if err = cur.All(ctx, &todos); err != nil {
		return todoList, errors.New("failed to load data")
	}

	for _, t := range todos {
		todoList = append(todoList, models.Todo{
			ID:        t.ID.Hex(),
			Title:     t.Title,
			Completed: t.Completed,
			CreatedAt: t.CreatedAt,
		})
	}

	return todoList, nil
}
