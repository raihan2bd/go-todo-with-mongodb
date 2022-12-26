package controllers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
	"github.com/justinas/nosurf"
	"github.com/raihan2bd/go-todo-with-mongodb/helpers"
	"github.com/raihan2bd/go-todo-with-mongodb/models"
	"github.com/thedevsaddam/renderer"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var rnd *renderer.Render
var db *mongo.Collection
var ctx = context.TODO()

// connect the database
func init() {
	rnd = renderer.New()

	// load env file
	if err := godotenv.Load(); err != nil {
		log.Fatal("There is no env file")
	}

	// get env variable
	mongoUri := os.Getenv("MONGO_URI")
	clientOptions := options.Client().ApplyURI(mongoUri)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}
	db = client.Database(os.Getenv("DB_NAME")).Collection(os.Getenv("COLLECTION_NAME"))
}

// Home Handler
func HomeHandler(w http.ResponseWriter, r *http.Request) {
	todos, err := helpers.FetchTodosFormDB(db)
	if err != nil {
		rnd.JSON(w, http.StatusProcessing, renderer.M{
			"message": "Failed to fetch todo",
			"error":   err,
		})

		return
	}

	data := models.TemplateData{
		CSRFToken: nosurf.Token(r),
		Todos:     todos,
	}
	err = rnd.Template(w, http.StatusOK, []string{"views/index.html"}, data)
	if err != nil {
		log.Fatal(err)
	}
}

// Fetch all todos
func FetchTodos(w http.ResponseWriter, r *http.Request) {
	todos, err := helpers.FetchTodosFormDB(db)
	if err != nil {
		rnd.JSON(w, http.StatusProcessing, renderer.M{
			"message": "Failed to fetch todo",
			"error":   err,
		})

		return
	}
	rnd.JSON(w, http.StatusOK, renderer.M{
		"data": todos,
	})
}

// Create todo
func CreateTodo(w http.ResponseWriter, r *http.Request) {
	var t models.TodoModel
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		rnd.JSON(w, http.StatusProcessing, err)
		return
	}

	if t.Title == "" {
		rnd.JSON(w, http.StatusBadRequest, renderer.M{
			"message": "The title is required",
		})

		return
	}

	tm := models.TodoModel{
		ID:        t.ID,
		Title:     t.Title,
		Completed: false,
		CreatedAt: time.Now(),
	}

	_, err := db.InsertOne(ctx, &tm)
	if err != nil {
		rnd.JSON(w, http.StatusProcessing, renderer.M{
			"message": "Failed to save",
			"error":   err,
		})
		return
	}

	todos, err := helpers.FetchTodosFormDB(db)
	if err != nil {
		rnd.JSON(w, http.StatusProcessing, renderer.M{
			"message": "Failed to fetch todo",
			"error":   err,
		})

		return
	}

	rnd.JSON(w, http.StatusCreated, renderer.M{
		"message": "todo is created successfully",
		"todos":   todos,
	})
}

// Update todo
func UpdateTodo(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimSpace(chi.URLParam(r, "id"))

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		rnd.JSON(w, http.StatusBadRequest, renderer.M{
			"message": "The id is invalid",
		})
		return
	}

	var t models.TodoModel

	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		rnd.JSON(w, http.StatusProcessing, err)
		return
	}

	// simple validation
	if t.Title == "" {
		rnd.JSON(w, http.StatusBadRequest, renderer.M{
			"message": "The title field is requried",
		})
		return
	}

	filter := bson.M{"_id": objID}
	update := bson.M{"$set": bson.M{"title": t.Title, "completed": t.Completed}}
	_, err = db.UpdateOne(ctx, filter, update)

	if err != nil {
		rnd.JSON(w, http.StatusProcessing, renderer.M{
			"message": "Failed to update todo",
			"error":   err,
		})
		return
	}

	todos, err := helpers.FetchTodosFormDB(db)
	if err != nil {
		rnd.JSON(w, http.StatusProcessing, renderer.M{
			"message": "Failed to fetch todo",
			"error":   err,
		})

		return
	}

	rnd.JSON(w, http.StatusOK, renderer.M{
		"message": "Todo updated successfully",
		"todos":   todos,
	})
}

// Delete One Todo
func DeleteOneTodo(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimSpace(chi.URLParam(r, "id"))

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		rnd.JSON(w, http.StatusBadRequest, renderer.M{
			"message": "The id is invalid",
		})
		return
	}

	_, err = db.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		rnd.JSON(w, http.StatusProcessing, renderer.M{
			"message": "Failed to delete todo",
			"error":   err,
		})
		return
	}

	todos, err1 := helpers.FetchTodosFormDB(db)
	if err1 != nil {
		rnd.JSON(w, http.StatusProcessing, renderer.M{
			"message": "Failed to fetch todo",
			"error":   err1,
		})

		return
	}

	rnd.JSON(w, http.StatusOK, renderer.M{
		"message": "todo is successfully deleted",
		"todos":   todos,
	})
}

// Delete completed todos
func DeleteCompleted(w http.ResponseWriter, r *http.Request) {
	filter := bson.M{
		"completed": bson.M{
			"$eq": true,
		},
	}
	_, err := db.DeleteMany(ctx, filter)
	if err != nil {
		rnd.JSON(w, http.StatusProcessing, renderer.M{
			"message": "Failed to delete completed todos",
			"error":   err,
		})
		return
	}

	todos, err1 := helpers.FetchTodosFormDB(db)
	if err1 != nil {
		rnd.JSON(w, http.StatusProcessing, renderer.M{
			"message": "Failed to fetch todo",
			"error":   err1,
		})

		return
	}

	rnd.JSON(w, http.StatusOK, renderer.M{
		"message": "todo is successfully deleted",
		"todos":   todos,
	})
}
