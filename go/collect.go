package main

import (
    "fmt"
    "github.com/kklis/gomemcache"
    "database/sql"
    _ "github.com/go-sql-driver/mysql"
)

func main() {

    db, _ := sql.Open("mysql", "solarcollector:enDEGTwujbaDB9yMU3wnwRJZ@/solar")
    defer db.Close()
    var version string

    db.QueryRow("SELECT 1").Scan(&version)
    fmt.Println("Connected to:", version)

    // If you want to use this with UNIX domain socket, you can use like a following source code.
    // On a UNIX domain socket, port is 0.
    // mc, err := gomemcache.Connect("/path/to/memcached.sock", 0)
    memc, err := gomemcache.Connect("127.0.0.1", 11211)
    if err != nil {
        panic(err)
    }

//    val, fl, _ := memc.Get("SolarStats:outsideTemperature")
    val, fl, _ := memc.Get("SolarStats:outsideTemperature")
    fmt.Printf("%s %d\n", val, fl)
}
