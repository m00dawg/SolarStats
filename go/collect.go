package main

import (
    "io/ioutil"
    "os"
    "fmt"
    "net/http"
    "encoding/xml"
    "github.com/kklis/gomemcache"
    "database/sql"
    _ "github.com/go-sql-driver/mysql"
)

func main() {
    type Value struct {
      val int
    }
    type Data struct {
      ts int
      Grid Value
      Solar Value
      SolarPlus Value
    }
    type eGauge struct {
      data Data
    }
    eg := eGauge{ }

    db, _ := sql.Open("mysql", "solarcollector:enDEGTwujbaDB9yMU3wnwRJZ@/solar")
    defer db.Close()
    var version string

    db.QueryRow("SELECT 1").Scan(&version)
    fmt.Println("Connected to:", version)

    response, err := http.Get("http://192.168.100.17/cgi-bin/egauge")
    if err != nil {
        fmt.Printf("%s", err)
        os.Exit(1)
    } else {
        defer response.Body.Close()
        contents, err := ioutil.ReadAll(response.Body)
        if err != nil {
            fmt.Printf("%s", err)
            os.Exit(1)
        }
        fmt.Printf("%s\n", string(contents))
        //err := xml.Unmarshal([]byte(contents), &eg)
        xml.Unmarshal([]byte(contents), &eg)
      	if err != nil {
      		fmt.Printf("error: %v", err)
      		return
      	}
        fmt.Printf("Grid: %i\n", eg.data.Grid.val)
    }

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
