package routes

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/raihan2bd/go-todo-with-mongodb/controllers"
	"github.com/raihan2bd/go-todo-with-mongodb/middleware"
)

func Router() http.Handler {
	router := chi.NewRouter()
	router.Use(middleware.Nosurf)
	router.Get("/", controllers.HomeHandler)
	router.Mount("/todo", todoHandler())
	router.Delete("/todo/delete-completed", controllers.DeleteCompleted)
	//serve static files
	fileServer := http.FileServer(http.Dir("./static/"))
	router.Handle("/static/*", http.StripPrefix("/static", fileServer))

	return router
}

func todoHandler() http.Handler {
	rg := chi.NewRouter()
	rg.Group(func(r chi.Router) {
		r.Get("/", controllers.FetchTodos)
		r.Post("/", controllers.CreateTodo)
		r.Put("/{id}", controllers.UpdateTodo)
		r.Delete("/{id}", controllers.DeleteOneTodo)
	})

	return rg
}
